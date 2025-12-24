export const styles = {
  appBar: {
    borderRadius: 15,
    margin: '30px 0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 50px',
    backgroundColor: '#1e293b', // Dark theme
    border: '1px solid #334155',
    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
  },
  heading: {
    color: '#00BFFF', // Sky Blue Theme
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '2rem',
    letterSpacing: '2px',
    flexGrow: { xs: 1, md: 0 }, // Center on mobile, left on desktop
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  desktopMenu: {
    display: { xs: 'none', md: 'flex' }, // Hide on mobile
    gap: '20px',
  },
  navButton: {
    color: '#ffffff',
    textTransform: 'none',
    fontSize: '1rem',
    '&:hover': {
        color: '#00BFFF',
        backgroundColor: 'transparent',
    }
  },
  rightSection: {
    display: { xs: 'none', md: 'flex' },
    alignItems: 'center',
  },
  purple: {
    color: '#fff',
    backgroundColor: '#00BFFF',
    marginLeft: '10px',
  },
  signin: {
    backgroundColor: '#00BFFF',
    color: 'white',
    '&:hover': {
        backgroundColor: '#009ACD',
    }
  },
  logout: {
    backgroundColor: 'black',
    color: 'white',
    marginLeft: '15px',
    '&:hover': {
        backgroundColor: '#333',
    }
  },
  mobileMenuIcon: {
    display: { xs: 'flex', md: 'none' }, // Show only on mobile
  }
};