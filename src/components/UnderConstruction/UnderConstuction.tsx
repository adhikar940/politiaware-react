import React from 'react';

const UnderConstruction = () => {
  return (
    <div style={styles.container}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/679/679720.png"
        alt="Under Construction"
        style={styles.image}
      />
      <h2 style={styles.text}>Map view is under construction</h2>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    color: '#555',
  },
  image: {
    width: '100px',
    marginBottom: '20px',
  },
  text: {
    fontSize: '1.5rem',
  },
};

export default UnderConstruction;
