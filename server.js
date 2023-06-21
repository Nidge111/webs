// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');
const cors = require('cors');



// Create an instance of the Express application
const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://immagiveitago.s3-website.eu-north-1.amazonaws.com/'); // Replace with your Angular app's URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, id, Username'); // Add the required headers
  next();
});

// Configure middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors());

// Create a connection pool
const pool = mysql.createPool({
 host: 'website.codfvu1pgxsn.eu-north-1.rds.amazonaws.com',
  poet: '3306',
  user: 'root',
  password: 'password',
  database: 'userdata',
});

app.post('/signup', (req, res) => {
  try {
    // Get user data from the request body
    const { firstName, lastName, dob, email, password, pronouns, username } = req.body;

    // Check if the email already exists in the database
    pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (error, results) => {
        if (error) {
          console.error('Database connection error:', error);
          res.status(500).json({ message: 'An error occurred while checking the email' });
          return;
        }

        if (results.length > 0) {
          // Email already exists, return an error response
          res.status(400).json({ message: 'Email already registered' });
          return;
        }

        // Check if the username already exists in the database
        pool.query(
          'SELECT * FROM users WHERE username = ?',
          [username],
          (error, results) => {
            if (error) {
              console.error('Database connection error:', error);
              res.status(500).json({ message: 'An error occurred while checking the username' });
              return;
            }

            if (results.length > 0) {
              // Username already exists, return an error response
              res.status(400).json({ message: 'Username already registered' });
              return;
            }

            // Email and username don't exist, proceed with user registration
            pool.query(
              'INSERT INTO users (username, first_Name, last_Name, dob, email, password, pronouns) VALUES (?, ?, ?, ?, ?, ?,?)',
              [username, firstName, lastName, dob, email, password, pronouns],
              (error, results) => {
                if (error) {
                  console.error('Database connection error:', error);
                  res.status(500).json({ message: 'An error occurred while saving the user data' });
                  return;
                }

                pool.query(
                  'INSERT INTO profiles (username, bio, socialMediaLink1, socialMediaLink2, email) VALUES (?, ?, ?, ?, ?)',
                  [username, null, null, null, email],
                  (error, results) => {
                    if (error) {
                      console.error('Database connection error:', error);
                      res.status(500).json({ message: 'An error occurred while saving the user data' });
                      return;
                    }

                    res.status(200).json({ message: 'Registration successful' });
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'An error occurred while processing the request' });
  }
});

app.get('/checkUsername', (req, res) => {
  const { email } = req.query;

  // Use the connection pool to perform database operations
  pool.query(
    'SELECT * FROM profiles WHERE email = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while checking the username' });
        return;
      }

      if (results.length > 0) {
        res.status(200).json({ message: 'Username exists' });
      } else {
        res.status(404).json({ message: 'Username does not exist' });
      }
    }
  );
});

app.post('/verifyPassword', (req, res) => {
  const { email, password } = req.body;

  // Use the connection pool to perform database operations
  pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while verifying the password' });
        return;
      }

      if (results.length > 0) {
        const user = results[0];
        if (user.password === password) {
          res.status(200).json({ message: 'Password matches' });
        } else {
          res.status(401).json({ message: 'Password does not match' });
        }
      } else {
        res.status(404).json({ message: 'Username does not exist' });
      }
    }
  );
});

app.get('/profile', (req, res) => {
  const { email } = req.query;
  
  // Use the connection pool to perform database operations
  pool.query(
    'SELECT username, bio, socialMediaLink1, socialMediaLink2 FROM profiles WHERE emai = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while fetching the user profile' });
        return;
      }

      if (results.length > 0) {
        const profile = results[0];
        // Return the user profile data as a response
        res.status(200).json(profile);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    }
  );
});

app.put('/profile', (req, res) => {
  const { email, username, bio, socialMediaLink1, socialMediaLink2 } = req.body;

  // Use the connection pool to perform database operations
  pool.query(
    'UPDATE profiles SET bio = ?, socialMediaLink1 = ?, socialMediaLink2 = ? WHERE username = ?',
    [bio, socialMediaLink1, socialMediaLink2, email],
    (error) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while updating the user profile' });
        return;
      }

      res.status(200).json({ message: 'Profile updated successfully' });
    }
  );
});

app.get('/random-accounts', (req, res) => {
  // Use the connection pool to perform database operations
  pool.query('SELECT username, bio, id FROM profiles ORDER BY RAND() LIMIT 5', (err, results) => {
    if (err) {
      console.error('Error fetching random accounts:', err);
      res.status(500).json({ error: 'An error occurred while fetching random accounts' });
    } else {
      res.json(results);
    }
  });
});


app.get('/account/:username', (req, res) => {
  const username = req.params.username;

  // Use the connection pool to perform the database query
  pool.query(
    'SELECT username, bio FROM profiles WHERE username = ?',
    [username],
    (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'An error occurred while fetching account details' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ message: 'Account not found' });
        return;
      }

      const account = results[0];
      res.status(200).json(account);
    }
  );
})

app.get('/username', (req, res) => {
  const { email } = req.query;

  // Use the connection pool to perform database operations
  pool.query(
    'SELECT username FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while retrieving the username' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ message: 'Username not found' });
        return;
      }

      const username = results[0].username;
      res.status(200).json({ username });
    }
  );
});


app.post('/ads', (req, res) => {
  const { title, category, description, contact, email } = req.body;

  pool.query(
    'INSERT INTO ads (title, category, description, contact, email) VALUES (?, ?, ?, ?, ?)',
    [title, category, description, contact, email],
    (error, results) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while saving the ad data' });
        return;
      }

      res.status(200).json({ message: 'Ad submitted successfully' });
    }
  );
});

app.get('/ads/:username', (req, res) => {
  const { username } = req.params;

  // Use the connection pool to perform database operations
  pool.query('SELECT id, title, category, description, contact FROM ads WHERE email = ?', [username], (err, results) => {
    if (err) {
      console.error('Error fetching ads by username:', err);
      res.status(500).json({ error: 'An error occurred while fetching ads' });
    } else {
      res.json(results);
    }
  });
});


app.get('/random-ads', (req, res) => {
  // Use the connection pool to perform database operations
  pool.query('SELECT title, category, description, contact, email, id FROM ads ORDER BY RAND() LIMIT 5', (err, results) => {
    if (err) {
      console.error('Error fetching random ads:', err);
      res.status(500).json({ error: 'An error occurred while fetching random ads' });
    } else {
      res.json(results);
    }
  });
});

app.get('/ads/:username/:id', (req, res) => {
  const { username, id } = req.params;

  // Use the connection pool to perform database operations
  pool.query('SELECT id, category, title, description, contact FROM ads WHERE email = ? AND id = ?', [username, id], (err, results) => {
    if (err) {
      console.error('Error fetching ad by username and ID:', err);
      res.status(500).json({ error: 'An error occurred while fetching ad' });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'Ad not found' });
    } else {
      res.json(results[0]);
    }
  });
});



app.put('/ads/update', (req, res) => {
  const { title, category, description, contact } = req.body;
  const id = req.headers['id'];
  const username = req.headers['username'];

  // Use the connection pool to perform database operations
  pool.query(
    'UPDATE ads SET title = ?, category = ?, description = ?, contact = ? WHERE id = ? AND email = ?',
    [title, category, description, contact, id, username],
    (error) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while updating the ad' });
        return;
      }

      res.status(200).json({ message: 'Ad updated successfully' });
    }
  );
});

app.get('/search', (req, res) => {
  const { q: searchTerm, category: selectedCategory } = req.query;

  if (!searchTerm) {
    if (selectedCategory === 'all' || selectedCategory === 'users') {
      // Retrieve all users
      pool.query('SELECT username, bio FROM profiles', (err, userResults) => {
        if (err) {
          console.error('Error fetching user search results:', err);
          res.status(500).json({ error: 'An error occurred while fetching user search results' });
        } else {
          if (selectedCategory === 'all' || selectedCategory === 'ads') {
            // Retrieve all ads
            pool.query('SELECT id, email, title, category FROM ads', (err, adsResults) => {
              if (err) {
                console.error('Error fetching ads search results:', err);
                res.status(500).json({ error: 'An error occurred while fetching ads search results' });
              } else {
                const results = [...userResults, ...adsResults];
                res.json(results);
              }
            });
          } else {
            res.json(userResults);
          }
        }
      });
    } else if (selectedCategory === 'ads') {
      // Retrieve all ads
      pool.query('SELECT id, email, title, category FROM ads', (err, results) => {
        if (err) {
          console.error('Error fetching ads search results:', err);
          res.status(500).json({ error: 'An error occurred while fetching ads search results' });
        } else {
          res.json(results);
        }
      });
    } else {
      res.json([]);
    }
  } else {
    if (selectedCategory === 'all' || selectedCategory === 'users') {
      // Perform user search query based on searchTerm
      pool.query('SELECT username, bio FROM profiles WHERE username LIKE ?', [`%${searchTerm}%`], (err, userResults) => {
        if (err) {
          console.error('Error fetching user search results:', err);
          res.status(500).json({ error: 'An error occurred while fetching user search results' });
        } else {
          if (selectedCategory === 'all' || selectedCategory === 'ads') {
            // Perform ads search query based on searchTerm
            pool.query('SELECT id, email, title, category FROM ads WHERE title LIKE ?', [`%${searchTerm}%`], (err, adsResults) => {
              if (err) {
                console.error('Error fetching ads search results:', err);
                res.status(500).json({ error: 'An error occurred while fetching ads search results' });
              } else {
                const results = [...userResults, ...adsResults];
                res.json(results);
              }
            });
          } else {
            res.json(userResults);
          }
        }
      });
    } else if (selectedCategory === 'ads') {
      // Perform ads search query based on searchTerm
      pool.query('SELECT id, email, title, category FROM ads WHERE title LIKE ?', [`%${searchTerm}%`], (err, results) => {
        if (err) {
          console.error('Error fetching ads search results:', err);
          res.status(500).json({ error: 'An error occurred while fetching ads search results' });
        } else {
          res.json(results);
        }
      });
    } else {
      res.json([]);
    }
  }
});

app.delete('/ads/delete', (req, res) => {
  const id = req.headers['id'];
  const username = req.headers['username'];

  // Use the connection pool to perform database operations
  pool.query(
    'DELETE FROM ads WHERE id = ? AND email = ?',
    [id, username],
    (error) => {
      if (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'An error occurred while deleting the ad' });
        return;
      }

      res.status(200).json({ message: 'Ad deleted successfully' });
    }
  );
});


// Start the server
const port = 3000; // Choose a suitable port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
