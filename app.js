const mysql = require('mysql2/promise');
const express = require('express');
const fs = require('fs');
require('dotenv').config();


const app = express();
const PORT = 3000;

const pool = mysql.createPool({
  host: '163.66.85.182',
  user: 'sano4dbuser',
  password: 'sano4etl!',
  database: 'juvonno_sanolivinginc_etl',
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

  const [results] = await pool.query(`SELECT
	c.customer_id AS CustomerID,
	c.customer_num AS CustomerNum,
    c.customer_name AS Name,
    c.customer_email AS Email,
    c.customer_contact AS ContactNumber,
    c.customer_cell AS CellNumber,
    c.customer_dob AS DOB,
    customermedicalprofile_encounter_id AS EncounterID,
    customermedicalprofile_advanced_medical_profile AS AdvancedMedicalProfile,
    (select encounter_summary from tbl_encounters where encounter_id=cm.customermedicalprofile_encounter_id) chart_Notes,
    customermedicalprofile_cancer AS HasCancer,
    customermedicalprofile_cancer_notes AS CancerNotes,
    customermedicalprofile_diabetes AS HasDiabetes,
    customermedicalprofile_diabetes_notes AS DiabetesNotes,
    customermedicalprofile_epilepsy AS HasEpilepsy,
    customermedicalprofile_epilepsy_notes AS EpilepsyNotes,
    customermedicalprofile_highbloodpressure AS HasHighBP,
    customermedicalprofile_highbloodpressure_notes AS HighBPNotes,
    customermedicalprofile_heartdisease AS HasHeartDisease,
    customermedicalprofile_heartdisease_notes AS HeartDiseaseNotes,
    customermedicalprofile_angina AS HasAngina,
    customermedicalprofile_angina_notes AS AnginaNotes,
    customermedicalprofile_breath AS HasBreathingIssues,
    customermedicalprofile_breath_notes AS BreathingIssuesNotes,
    customermedicalprofile_stroke AS HasStroke,
    customermedicalprofile_stroke_notes AS StrokeNotes,
    customermedicalprofile_circulatory AS HasCirculatoryIssues,
    customermedicalprofile_circulatory_notes AS CirculatoryIssuesNotes,
    customermedicalprofile_kidney AS HasKidneyIssues,
    customermedicalprofile_kidney_notes AS KidneyIssuesNotes,
    customermedicalprofile_bowelbladder AS HasBowelBladderIssues,
    customermedicalprofile_bowelbladder_notes AS BowelBladderNotes,
    customermedicalprofile_arthritis AS HasArthritis,
    customermedicalprofile_arthritis_notes AS ArthritisNotes,
    customermedicalprofile_thyroid AS HasThyroidIssues,
    customermedicalprofile_thyroid_notes AS ThyroidNotes,
    customermedicalprofile_psychiatric AS HasPsychiatricIssues,
    customermedicalprofile_psychiatric_notes AS PsychiatricNotes,
    customermedicalprofile_osteoporosis AS HasOsteoporosis,
    customermedicalprofile_osteoporosis_notes AS OsteoporosisNotes,
    customermedicalprofile_sensationloss AS HasSensationLoss,
    customermedicalprofile_sensationloss_notes AS SensationLossNotes,
    customermedicalprofile_hemophilia AS HasHemophilia,
    customermedicalprofile_hemophilia_notes AS HemophiliaNotes,
    customermedicalprofile_ulcers AS HasUlcers,
    customermedicalprofile_ulcers_notes AS UlcersNotes,
    customermedicalprofile_allergies AS HasAllergies,
    customermedicalprofile_allergies_notes AS AllergiesNotes,
    customermedicalprofile_asthma AS HasAsthma,
    customermedicalprofile_asthma_notes AS AsthmaNotes,
    customermedicalprofile_hivaids AS HasHIVAIDS,
    customermedicalprofile_hivaids_notes AS HIVAIDSNotes,
    customermedicalprofile_hepatitis AS HasHepatitis,
    customermedicalprofile_hepatitis_notes AS HepatitisNotes,
    customermedicalprofile_lungdisease AS HasLungDisease,
    customermedicalprofile_lungdisease_notes AS LungDiseaseNotes,
    customermedicalprofile_depression AS HasDepression,
    customermedicalprofile_depression_notes AS DepressionNotes,
    customermedicalprofile_anxiety AS HasAnxiety,
    customermedicalprofile_anxiety_notes AS AnxietyNotes,
    customermedicalprofile_hypertension AS HasHypertension,
    customermedicalprofile_hypertension_notes AS HypertensionNotes,
    customermedicalprofile_cardiovasculardisease AS HasCardiovascularDisease,
    customermedicalprofile_cardiovasculardisease_notes AS CardiovascularDiseaseNotes,
    customermedicalprofile_liverdisease AS HasLiverDisease,
    customermedicalprofile_liverdisease_notes AS LiverDiseaseNotes,
    customermedicalprofile_anemia AS HasAnemia,
    customermedicalprofile_anemia_notes AS AnemiaNotes,
    customermedicalprofile_oa_ddd_djd AS HasOsteoarthritis_DDD_DJD,
    customermedicalprofile_oa_ddd_djd_notes AS Osteoarthritis_DDD_DJD_Notes,
    customermedicalprofile_other AS OtherConditions,
    customermedicalprofile_testing_xray AS HasXrayTest,
    customermedicalprofile_testing_ctscan AS HasCTScan,
    customermedicalprofile_testing_mri AS HasMRI,
    customermedicalprofile_testing_emg AS HasEMGTest,
    customermedicalprofile_testing_bonescan AS HasBoneScan,
    customermedicalprofile_testing_whenwhere AS TestDetails,
    customermedicalprofile_bloodwork AS HasBloodwork,
    customermedicalprofile_bloodwork_notes AS BloodworkNotes,
    customermedicalprofile_urinalysis AS HasUrinalysis,
    customermedicalprofile_urinalysis_notes AS UrinalysisNotes,
    customermedicalprofile_weightgain AS HasWeightGain,
    customermedicalprofile_weightgain_notes AS WeightGainNotes,
    customermedicalprofile_functionalproblems AS HasFunctionalProblems,
    customermedicalprofile_functionalproblems_notes AS FunctionalProblemsNotes,
    customermedicalprofile_pregnant AS IsPregnant,
    customermedicalprofile_pregnant_notes AS PregnancyNotes,
    customermedicalprofile_metalimplants AS HasMetalImplants,
    customermedicalprofile_metalimplants_notes AS MetalImplantsNotes,
    customermedicalprofile_pacemaker AS HasPacemaker,
    customermedicalprofile_pacemaker_notes AS PacemakerNotes,
    customermedicalprofile_treatments AS UndergoingTreatments,
    customermedicalprofile_treatments_whenwhere AS TreatmentDetails,
    customermedicalprofile_height AS Height,
    customermedicalprofile_height_type AS HeightType,
    customermedicalprofile_weight AS Weight,
    customermedicalprofile_weight_type AS WeightType,
    customermedicalprofile_waist AS Waist,
    customermedicalprofile_waist_type AS WaistType,
    customermedicalprofile_bp_systolic AS BPSystolic,
    customermedicalprofile_bp_diastolic AS BPDiastolic,
    customermedicalprofile_pulse_sitting AS PulseSitting,
    customermedicalprofile_pulse_lying AS PulseLying,
    customermedicalprofile_pulse_standing AS PulseStanding,
    customermedicalprofile_temp AS BodyTemp,
    customermedicalprofile_injury_date AS InjuryDate,
    customermedicalprofile_date AS ProfileDate,
    c.customer_creation_date AS CreationDate,
    c.customer_modification_date AS ModificationDate,
    c.customer_date_added AS DateAdded,
    c.customer_last_completed_appointment AS LastCompletedAppointment,
    c.customer_discharge_date AS DischargeDate,
    c.customer_status AS Status,
    c.customer_notes AS Notes
FROM
  tbl_customers c
   JOIN
  tbl_customer_medicalprofile cm
  ON c.customer_id = cm.customermedicalprofile_customer_id
 WHERE
  c.customer_id=?`,[parameter.id]);

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