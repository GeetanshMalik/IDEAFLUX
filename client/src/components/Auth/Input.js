import React from 'react';
import { TextField, Grid, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Input = ({ name, handleChange, label, half, autoFocus, type, handleShowPassword }) => {
  // Map field names to appropriate autocomplete values
  const getAutocomplete = (fieldName) => {
    switch (fieldName) {
      case 'firstName': return 'given-name';
      case 'lastName': return 'family-name';
      case 'email': return 'email';
      case 'password': return 'new-password';
      case 'confirmPassword': return 'new-password';
      default: return 'off';
    }
  };

  return (
    <Grid item xs={12} sm={half ? 6 : 12}>
      <TextField
        name={name}
        onChange={handleChange}
        variant="outlined"
        required
        fullWidth
        label={label}
        autoFocus={autoFocus}
        type={type}
        autoComplete={getAutocomplete(name)}
        sx={{
            bgcolor: '#0f172a', // Dark background for input
            input: { color: 'white' },
            label: { color: '#94a3b8' },
            '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#14b8a6' },
            }
        }}
        InputProps={name === 'password' ? {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleShowPassword} sx={{ color: '#94a3b8' }}>
                {type === 'password' ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        } : null}
      />
    </Grid>
  );
};

export default Input;