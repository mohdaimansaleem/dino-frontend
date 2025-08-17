import React from 'react';
import {
  Box,
  Button,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { Category, FilterList } from '@mui/icons-material';

interface MenuFiltersProps {
  categories: any[];
  onAddCategory: () => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  categories,
  onAddCategory
}) => {
  const theme = useTheme();

  return (null);
};

export default MenuFilters;