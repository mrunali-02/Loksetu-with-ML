const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // ⭐ NEW

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://0.0.0.0:27017/galleryAchievementsDB';

// ----------------- Ensure uploads directory exists -----------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ----------------- MongoDB Connection -----------------
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ----------------- Middleware -----------------
app.use(cors());
app.use('/uploads', express.static(uploadDir));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- Extra Routers -----------------
const chatbotRouter = require('./routes/chatbot');
app.use('/api', chatbotRouter);

const analyticsRouter = require('./routes/analytics');
app.use('/api', analyticsRouter);

// ----------------- Multer Setup -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// ----------------- Schemas -----------------
const gallerySchema = new mongoose.Schema({
  type: { type: String, enum: ['photo', 'video'], required: true },
  url: String,
  caption: String,
  year: Number,
  eventType: String,
});

const achievementSchema = new mongoose.Schema({
  title: String,
  year: Number,
  issuer: String,
  certificate: String,
});

const initiativeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  short_description: String,
  impact_metrics: { people_helped: { type: Number, default: 0 } },
  photos: [String],
  tags: { type: [String], default: [] } // ⭐ Auto Tagging Output
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: "General" }, // ⭐ Auto Classification Output
  description: String,
  date: { type: Date, required: true },
  venue: String,
  organizers: String,
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  poster: String,
  photos: [String],
  volunteerCap: { type: Number, default: null },
  registered: { type: Number, default: 0 },
  capacity: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  actual_participants: { type: Number, default: null },
  participants: [
    {
      name: String,
      phone: String,
      email: String,
      age: Number,
      role: { type: String, enum: ['Volunteer', 'Participant'], default: 'Participant' },
      attended: { type: Boolean, default: false }
    }
  ]
}, { timestamps: true });

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Initiative = mongoose.model('Initiative', initiativeSchema);
const Event = mongoose.model('Event', eventSchema);

const settingsSchema = new mongoose.Schema({
  password: { type: String, default: "admin123" },
  contactEmail: String,
  phone: String,
  logo: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  }
});
const Settings = mongoose.model('Settings', settingsSchema);

// ----------------- Events Routes -----------------

app.get('/api/events', async (req, res) => {
  try {
    const { search, category, tags, dateFrom, dateTo, availability } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    if (availability) {
      if (availability === 'available') {
        query.$expr = { $lt: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', Number.MAX_SAFE_INTEGER] }] };
      }
      else if (availability === 'filling') {
        query.$expr = {
          $and: [
            { $gte: [{ $divide: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', 1] }] }, 0.7] },
            { $lt: [{ $divide: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', 1] }] }, 1.0] }
          ]
        };
      }
      else if (availability === 'full') {
        query.$expr = { $gte: ['$registered', { $ifNull: ['$capacity', '$volunteerCap', Number.MAX_SAFE_INTEGER] }] };
      }
    }

    const events = await Event.find(query).sort({ date: 1 }).lean();
    res.json(events);
  } catch (err) {
    console.error("GET API Error:", err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/meta', async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    const tags = await Event.distinct('tags');
    res.json({ categories, tags });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

app.post('/api/events', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {

  const { title, description, date, venue, organizers, status, volunteerCap } = req.body;

  if (!title || !date)
    return res.status(400).json({ error: 'Title and date required' });

  const poster = req.files.poster
    ? `uploads/${req.files.poster[0].filename}`
    : '';

  const photoUrls = req.files.photos
    ? req.files.photos.map(f => `uploads/${f.filename}`)
    : [];

  // ⭐ Auto-Tagging Interception via Python Flask Zero-Shot Model
  let mlCategory = "General";
  try {
    const mlRes = await axios.post("http://localhost:8000/classify-event", { title, description: description || "" });
    if (mlRes.data && mlRes.data.category) {
      mlCategory = mlRes.data.category;
    }
  } catch (err) {
    console.warn("ML Classification Failed via Axios. Dropping to default.");
  }

  const newEvent = new Event({
    title,
    category: mlCategory,
    description,
    date: new Date(date),
    venue,
    organizers,
    status: status || 'Open',
    poster,
    photos: photoUrls,
    volunteerCap: volunteerCap ? Number(volunteerCap) : null
  });

  await newEvent.save();

  res.status(201).json(newEvent);
});

// ----------------- SETTINGS ROUTES -----------------
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', upload.single('logo'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (req.body.password) settings.password = req.body.password;
    if (req.body.contactEmail !== undefined) settings.contactEmail = req.body.contactEmail;
    if (req.body.phone !== undefined) settings.phone = req.body.phone;
    
    if (!settings.socialLinks) settings.socialLinks = {};
    if (req.body.facebook !== undefined) settings.socialLinks.facebook = req.body.facebook;
    if (req.body.twitter !== undefined) settings.socialLinks.twitter = req.body.twitter;
    if (req.body.instagram !== undefined) settings.socialLinks.instagram = req.body.instagram;
    if (req.body.linkedin !== undefined) settings.socialLinks.linkedin = req.body.linkedin;
    if (req.body.youtube !== undefined) settings.socialLinks.youtube = req.body.youtube;

    if (req.file) {
      settings.logo = `uploads/${req.file.filename}`;
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

app.delete('/api/settings/logo', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      settings.logo = null;
      await settings.save();
    }
    res.json({ message: "Logo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});

// ----------------- INITIATIVES ROUTES -----------------
app.get('/api/initiatives', async (req, res) => {
  try {
    const initiatives = await Initiative.find().sort({ date: -1 });
    res.json(initiatives);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch initiatives' });
  }
});

app.post('/api/initiatives', upload.fields([
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  const { title, category, date, location, short_description, impact_metrics } = req.body;
  
  // ⭐ Auto-Tagging Interception via Python Flask Zero-Shot Model
  let tags = ["Community Support"];
  try {
    const mlRes = await axios.post("http://localhost:8000/classify-initiative", { title, description: short_description || "" });
    if (mlRes.data && mlRes.data.tags) {
      tags = mlRes.data.tags;
    }
  } catch (err) {
    console.warn("ML Classification Failed via Axios. Dropping to default tags.");
  }
  
  const impact = impact_metrics ? JSON.parse(impact_metrics) : { people_helped: 0 };
  const photoUrls = req.files?.photos ? req.files.photos.map(f => `uploads/${f.filename}`) : [];

  const newInitiative = new Initiative({
    title, category, date: new Date(date), location, short_description,
    impact_metrics: impact, photos: photoUrls, tags
  });

  await newInitiative.save();
  res.status(201).json(newInitiative);
});

// ----------------- GET SUBMISSIONS ROUTES -----------------
app.get('/api/events/submissions', async (req, res) => {
  try {
    const events = await Event.find().lean();
    const result = events.map(ev => {
      const parts = ev.participants || [];
      return {
        eventId: ev._id,
        title: ev.title,
        volunteerCap: ev.volunteerCap,
        volunteers: parts.filter(p => p.role === 'Volunteer'),
        participants: parts.filter(p => p.role === 'Participant')
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/api/events/volunteers', async (req, res) => {
  try {
    const events = await Event.find().lean();
    const volunteersList = [];
    events.forEach(ev => {
      if (ev.participants) {
        ev.participants.forEach(p => {
          if (p.role === 'Volunteer') {
            volunteersList.push({
              name: p.name,
              email: p.email,
              phone: p.phone,
              age: p.age,
              eventTitle: ev.title
            });
          }
        });
      }
    });
    res.json(volunteersList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});


// ----------------- UPDATED REGISTRATION ROUTE -----------------

app.post('/api/events/:id/register', async (req, res) => {

  try {

    const { name, phone, email, age, role } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ error: 'Event not found' });

    // ⭐ CALL FLASK DUPLICATE DETECTION
    const response = await axios.post(
      "http://localhost:8000/check-duplicate",
      {
        name,
        phone,
        email,
        participants: event.participants
      }
    );

    if (response.data.duplicate) {

      return res.status(400).json({
        error: "You already registered for this event"
      });

    }

    const normalizedRole =
      role === "Volunteer" ? "Volunteer" : "Participant";

    if (
      normalizedRole === "Volunteer" &&
      event.volunteerCap !== null
    ) {

      const currentVolunteers =
        event.participants.filter(p => p.role === "Volunteer").length;

      if (currentVolunteers >= event.volunteerCap) {

        return res.status(400).json({
          error: "Volunteer registration is full"
        });

      }
    }

    event.participants.push({
      name,
      phone,
      email,
      age: Number(age),
      role: normalizedRole
    });

    await event.save();

    res.json({
      message: "Successfully registered",
      event
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Registration failed"
    });

  }

});

// ----------------- REPORT GENERATION (NODE -> PYTHON) --------------
app.post('/api/reports/generate', async (req, res) => {
  try {
    const events = await Event.find({}, 'title date participants volunteerCap').lean();
    const initiatives = await Initiative.find({}, 'title impact_metrics').lean();
    const achievements = await Achievement.find({}, 'title year').lean();

    let totalParticipants = 0;
    let totalVolunteers = 0;

    events.forEach(e => {
        if (e.participants) {
            e.participants.forEach(p => {
                if (p.role === 'Volunteer') totalVolunteers++;
                else totalParticipants++;
            });
        }
    });

    // Mock dropoff/duplicate metrics for ML analysis (Using earlier stress test values)
    const stats = {
      totalParticipants,
      totalVolunteers,
      dropoffRate: 24.5, // Mock historical dropoff percentage
      duplicatesBlocked: 140 // Mock block count from duplicate detection tests
    };

    const payload = { events, initiatives, achievements, stats };

    // Send data to Flask ML Microservice
    const pythonResponse = await axios.post("http://localhost:8000/generate-report", payload);
    
    res.json(pythonResponse.data);
  } catch (err) {
    console.error("Report generation failed:", err);
    res.status(500).json({ error: "Failed to generate report from ML API" });
  }
});

// ----------------- EVENT PARTICIPATION PREDICTION --------------
async function predictParticipation(eventId) {
  const targetEvent = await Event.findById(eventId).lean();
  if (!targetEvent) throw new Error("Event not found");

  const now = new Date();
  const targetDate = new Date(targetEvent.date);
  const daysUntil = Math.max(0, Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24)));

  // Fetch past events that have actual_participants reported
  const pastEventsQuery = await Event.find({
    actual_participants: { $ne: null },
    registered: { $ne: null }
  }).lean();

  const past_events = pastEventsQuery.map(e => {
    const dDate = new Date(e.date);
    // Approximate days_until_event at the time of past registration (heuristically using 7 days if unknown, or assuming it was similar)
    // Actually the prompt doesn't specify how to derive historical days_until_event. We can use a default or 0 since it's past
    return {
      capacity: e.volunteerCap || 0, // treating capacity as volunteerCap
      days_until_event: 0,
      category: e.category || "General",
      registered: e.registered || (e.participants ? e.participants.length : 0),
      actual_participants: e.actual_participants
    };
  });

  const payload = {
    capacity: targetEvent.volunteerCap || 0,
    days_until_event: daysUntil,
    category: targetEvent.category || "General",
    past_events: past_events,
    registered_so_far: targetEvent.registered || (targetEvent.participants ? targetEvent.participants.length : 0)
  };

  const pythonResponse = await axios.post("http://localhost:8000/predict-participation", payload);
  return pythonResponse.data;
}

app.get('/api/events/:id/predict', async (req, res) => {
  try {
    const prediction = await predictParticipation(req.params.id);
    res.json(prediction);
  } catch (err) {
    console.error("Prediction failed:", err);
    res.status(503).json({ error: "Failed to predict participation via ML API" });
  }
});

// ----------------- SERVER -----------------

app.listen(PORT, () => {

  console.log(`🚀 Server running on http://localhost:${PORT}`);

});