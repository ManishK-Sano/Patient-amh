const mysql = require('mysql2/promise');
const express = require('express');
const fs = require('fs');
require('dotenv').config();


const app = express();
const PORT = 3000;

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  ssl: {
    ca: fs.readFileSync('./certificate/ca.pem', 'utf8'),
    cert: fs.readFileSync('./certificate/client-cert.pem', 'utf8'),
    key: fs.readFileSync('./certificate/client-key.pem', 'utf8')
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication failed. Bearer token missing or invalid.' });
  }

  const token = authHeader.split(' ')[1];
  
  if (token !== process.env.TOKEN) {
    return res.status(403).json({ message: 'Authentication failed. Invalid token.' });
  }

  next();
});



app.get("/api/getamh", async (req, res) => {

  var parameter = req.query;

  try {

const [results] = await pool.query(`
  SELECT
    tc.customer_id,
    tc.customer_num,
    te.encounter_templates note_template,
    te.encounter_summary chart_note,
    encounter_date note_date,
    (select tcm.customermedicalprofile_advanced_medical_profile from
    tbl_customer_medicalprofile tcm
WHERE
    tcm.customermedicalprofile_customer_id = tc.customer_id
    AND tcm.customermedicalprofile_date = (
        SELECT MAX(customermedicalprofile_date)
        FROM tbl_customer_medicalprofile
        WHERE customermedicalprofile_customer_id = tcm.customermedicalprofile_customer_id
    )) advance_medical_history
FROM
    tbl_customers tc
        JOIN
    tbl_encounters te ON te.encounter_customer_id = tc.customer_id
WHERE
    tc.customer_id = ?`,[parameter.id]);

    console.log(results)

    res.json(results);
  } catch (err) {
    console.error('Error executing query:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }

  });



  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });