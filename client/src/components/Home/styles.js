export const styles = {
  gridContainer: {
    flexDirection: { xs: 'column-reverse', sm: 'row' }, // Stack on mobile, row on desktop
  },
  appBarSearch: {
    borderRadius: 4,
    marginBottom: '1rem',
    display: 'flex',
    padding: '16px',
  },
  pagination: {
    borderRadius: 4,
    marginTop: '1rem',
    padding: '16px',
    backgroundColor: '#fff',
  },
  searchButton: {
    marginTop: '10px',
    backgroundColor: '#00BFFF', // Sky Blue
    color: 'white',
    width: '100%',
    '&:hover': {
        backgroundColor: '#009ACD',
    }
  },
};