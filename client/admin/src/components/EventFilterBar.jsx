import React, { useRef, useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Button,
  Typography,
  Stack,
  IconButton
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function EventFilterBar({
  filters,
  setFilter,
  clearAll,
  resultCount,
  total,
  categories,
  allTags
}) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setFilter("search", val);
    }, 300);
  };

  const handleTagToggle = (tag) => {
    const currentTags = [...filters.tags];
    if (currentTags.includes(tag)) {
      setFilter("tags", currentTags.filter((t) => t !== tag));
    } else {
      currentTags.push(tag);
      setFilter("tags", currentTags);
    }
  };

  const hasFilters = Object.values(filters).some((val) => 
    (Array.isArray(val) ? val.length > 0 : val !== "")
  );

  return (
    <Box sx={{ mb: 4, p: 3, bgcolor: "background.paper", borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      {/* Top Search Row */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Search by Title or Description"
          variant="outlined"
          value={searchValue}
          onChange={handleSearchChange}
        />
      </Box>

      {/* Selectors and Dates */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilter("category", e.target.value)}
          >
            <MenuItem value=""><em>All Categories</em></MenuItem>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Availability</InputLabel>
          <Select
            value={filters.availability}
            label="Availability"
            onChange={(e) => setFilter("availability", e.target.value)}
          >
            <MenuItem value=""><em>Any Status</em></MenuItem>
            <MenuItem value="available">Has Spots Available</MenuItem>
            <MenuItem value="filling">Filling Fast (70%+ full)</MenuItem>
            <MenuItem value="full">Completely Full</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="From Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.dateFrom}
          onChange={(e) => setFilter("dateFrom", e.target.value)}
        />
        
        <TextField
          fullWidth
          label="To Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.dateTo}
          onChange={(e) => setFilter("dateTo", e.target.value)}
        />
      </Stack>

      {/* Tags Filter row */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
          Filter by AI Tags:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {allTags.map((tag) => {
            const isSelected = filters.tags.includes(tag);
            return (
              <Chip
                key={tag}
                label={tag}
                size="small"
                color={isSelected ? "primary" : "default"}
                onClick={() => handleTagToggle(tag)}
                variant={isSelected ? "filled" : "outlined"}
              />
            );
          })}
        </Box>
      </Box>

      {/* Active Filter Pills Map */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Box sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 2, mb: 2 }}>
              <Typography variant="caption" sx={{ display: "block", mb: 1, color: "text.secondary" }}>
                Active Filters:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                
                {filters.search && (
                  <Chip size="small" label={`Search: "${filters.search}"`} onDelete={() => setFilter("search", "")} />
                )}
                {filters.category && (
                  <Chip size="small" label={`Category: ${filters.category}`} onDelete={() => setFilter("category", "")} />
                )}
                {filters.availability && (
                  <Chip size="small" label={`Availability: ${filters.availability}`} onDelete={() => setFilter("availability", "")} />
                )}
                {filters.dateFrom && (
                  <Chip size="small" label={`From: ${filters.dateFrom}`} onDelete={() => setFilter("dateFrom", "")} />
                )}
                {filters.dateTo && (
                  <Chip size="small" label={`To: ${filters.dateTo}`} onDelete={() => setFilter("dateTo", "")} />
                )}
                {filters.tags.map((tag) => (
                  <Chip key={tag} size="small" label={`Tag: ${tag}`} onDelete={() => handleTagToggle(tag)} />
                ))}

              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Showing <strong>{resultCount}</strong> of <strong>{total}</strong> matched events
        </Typography>

        {hasFilters && (
          <Button variant="text" size="small" color="error" onClick={clearAll}>
            Clear All Filters
          </Button>
        )}
      </Box>

    </Box>
  );
}
