-- Seed topics
INSERT INTO public.topics (name, slug, description, icon) VALUES
  ('Cardiology', 'cardiology', 'Heart and cardiovascular system disorders', 'heart'),
  ('Respiratory', 'respiratory', 'Lung and respiratory system conditions', 'wind'),
  ('Airway Management', 'airway-management', 'Airway assessment and management techniques', 'lungs'),
  ('Trauma', 'trauma', 'Traumatic injuries and emergency care', 'activity'),
  ('Neurology', 'neurology', 'Nervous system disorders and emergencies', 'brain'),
  ('Pharmacology', 'pharmacology', 'Drug mechanisms and medication administration', 'pill'),
  ('Toxicology', 'toxicology', 'Poisoning and overdose management', 'flask'),
  ('Gastroenterology', 'gastroenterology', 'Digestive system disorders', 'stomach'),
  ('Endocrinology', 'endocrinology', 'Hormonal and metabolic disorders', 'droplet'),
  ('Renal / Urology', 'renal-urology', 'Kidney and urinary system conditions', 'kidney'),
  ('Hematology', 'hematology', 'Blood disorders and coagulation', 'droplets'),
  ('Infectious Disease', 'infectious-disease', 'Bacterial, viral, and fungal infections', 'bug'),
  ('Immunology', 'immunology', 'Immune system and allergic reactions', 'shield'),
  ('Dermatology', 'dermatology', 'Skin conditions and wounds', 'scan'),
  ('Musculoskeletal', 'musculoskeletal', 'Bone and muscle injuries', 'bone'),
  ('Psychiatry', 'psychiatry', 'Mental health emergencies', 'brain'),
  ('Pediatrics', 'pediatrics', 'Pediatric emergencies and care', 'baby'),
  ('Obstetrics and Gynecology', 'obgyn', 'Pregnancy and reproductive emergencies', 'baby'),
  ('Emergency Medicine', 'emergency-medicine', 'General emergency protocols', 'siren'),
  ('Critical Care', 'critical-care', 'Intensive care and critical patients', 'monitor'),
  ('Medical Emergencies', 'medical-emergencies', 'Acute medical conditions', 'alert-triangle'),
  ('Environmental Emergencies', 'environmental-emergencies', 'Heat, cold, and environmental injuries', 'thermometer'),
  ('EMS Operations', 'ems-operations', 'EMS protocols and scene management', 'truck'),
  ('Patient Assessment', 'patient-assessment', 'Assessment techniques and vital signs', 'clipboard'),
  ('Shock and Resuscitation', 'shock-resuscitation', 'Shock types and resuscitation protocols', 'zap'),
  ('Electrocardiography (ECG)', 'ecg', 'ECG interpretation and arrhythmias', 'activity')
ON CONFLICT (slug) DO NOTHING;

-- Seed sample flashcards for Cardiology
INSERT INTO public.flashcards (topic_id, question, answer) VALUES
  ((SELECT id FROM topics WHERE slug = 'cardiology'), 'What are the classic symptoms of acute myocardial infarction?', 'Chest pain or pressure (often described as crushing or squeezing), radiating to left arm, jaw, or back; shortness of breath; diaphoresis (sweating); nausea; and anxiety. Note: Women and diabetic patients may present atypically.'),
  ((SELECT id FROM topics WHERE slug = 'cardiology'), 'What is the initial treatment for STEMI?', 'MONA: Morphine (if pain not relieved by nitro), Oxygen (if SpO2 < 94%), Nitroglycerin (if BP allows), Aspirin 324mg chewed. Plus: 12-lead ECG, IV access, cardiac monitoring, and rapid transport for PCI.'),
  ((SELECT id FROM topics WHERE slug = 'cardiology'), 'What ECG findings indicate a STEMI?', 'ST-segment elevation of ≥1mm in two or more contiguous leads, or new left bundle branch block (LBBB). Look for reciprocal ST depression in opposite leads.'),
  ((SELECT id FROM topics WHERE slug = 'cardiology'), 'What is the difference between stable and unstable angina?', 'Stable angina: predictable chest pain with exertion, relieved by rest or nitroglycerin, lasts < 15 minutes. Unstable angina: new onset, occurs at rest, increasing frequency/severity, lasts > 15 minutes, not relieved by rest.'),
  ((SELECT id FROM topics WHERE slug = 'cardiology'), 'What are the contraindications for nitroglycerin?', 'Hypotension (SBP < 90-100 mmHg), recent use of phosphodiesterase inhibitors (Viagra, Cialis) within 24-48 hours, right ventricular infarction, and severe bradycardia or tachycardia.');

-- Seed sample flashcards for Respiratory
INSERT INTO public.flashcards (topic_id, question, answer) VALUES
  ((SELECT id FROM topics WHERE slug = 'respiratory'), 'What are the signs of impending respiratory failure?', 'Altered mental status, inability to speak in full sentences, accessory muscle use, paradoxical breathing, cyanosis, SpO2 < 90% despite supplemental O2, bradypnea or tachypnea > 30/min.'),
  ((SELECT id FROM topics WHERE slug = 'respiratory'), 'What is the treatment for acute asthma exacerbation?', 'Albuterol nebulizer (2.5-5mg) or MDI with spacer, ipratropium bromide, supplemental oxygen, corticosteroids (methylprednisolone IV or prednisone PO), and magnesium sulfate IV for severe cases.'),
  ((SELECT id FROM topics WHERE slug = 'respiratory'), 'What is the difference between COPD and asthma presentation?', 'COPD: chronic progressive dyspnea, productive cough, barrel chest, typically in smokers > 40yo, partially reversible. Asthma: episodic wheezing, often triggered by allergens/exercise, more common in younger patients, fully reversible with treatment.'),
  ((SELECT id FROM topics WHERE slug = 'respiratory'), 'What are the indications for CPAP in respiratory distress?', 'Acute pulmonary edema, COPD exacerbation, obstructive sleep apnea, cardiogenic pulmonary edema. Contraindications: facial trauma, vomiting, decreased LOC, pneumothorax.'),
  ((SELECT id FROM topics WHERE slug = 'respiratory'), 'What is tension pneumothorax and how do you treat it?', 'Life-threatening condition where air enters pleural space but cannot escape. Signs: severe dyspnea, tracheal deviation (late), absent breath sounds on affected side, hypotension, JVD. Treatment: immediate needle decompression at 2nd intercostal space, midclavicular line.');

-- Seed sample questions for Cardiology
INSERT INTO public.questions (topic_id, vignette, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
  ((SELECT id FROM topics WHERE slug = 'cardiology'),
   'A 58-year-old male presents with crushing substernal chest pain radiating to his left arm that started 45 minutes ago. He appears diaphoretic and anxious. Vital signs: BP 148/92, HR 98, RR 22, SpO2 96% on room air.',
   'What is the most appropriate initial intervention?',
   'Administer morphine sulfate 4mg IV',
   'Administer aspirin 324mg chewed',
   'Perform synchronized cardioversion',
   'Administer epinephrine 1mg IV',
   'B',
   'Aspirin is the first-line treatment for suspected acute coronary syndrome. It inhibits platelet aggregation and has been shown to reduce mortality. While the MONA protocol (Morphine, Oxygen, Nitroglycerin, Aspirin) is commonly taught, aspirin should be given first as it has the strongest evidence for improving outcomes.');

INSERT INTO public.questions (topic_id, vignette, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
  ((SELECT id FROM topics WHERE slug = 'cardiology'),
   'A 72-year-old female with history of CHF presents with acute shortness of breath. She has pink frothy sputum, bilateral crackles, and JVD. BP is 180/110, HR 120, SpO2 82% on room air.',
   'Which treatment is most appropriate for this patient?',
   'Fluid bolus of 500mL normal saline',
   'CPAP at 10 cmH2O and nitroglycerin',
   'Albuterol nebulizer treatment',
   'Immediate intubation',
   'B',
   'This patient is in acute pulmonary edema (cardiogenic). CPAP reduces preload and afterload while improving oxygenation. Nitroglycerin causes venodilation, reducing preload. Avoid fluid bolus as this will worsen pulmonary edema. CPAP should be tried before intubation if the patient is conscious and cooperative.');

-- Seed sample case simulation
INSERT INTO public.case_simulations (topic_id, title, difficulty, patient_history, vital_signs, physical_exam, lab_results, steps) VALUES
  ((SELECT id FROM topics WHERE slug = 'cardiology'),
   'Acute STEMI Management',
   'intermediate',
   'A 62-year-old male with history of hypertension and hyperlipidemia presents with severe chest pain that started 30 minutes ago while watching TV. Pain is described as crushing, 9/10, radiating to left arm and jaw. He took 2 aspirin at home before calling 911.',
   '{"bp": "158/96", "hr": "102", "rr": "24", "spo2": "94%", "temp": "37.1°C"}',
   'Alert and oriented but anxious. Diaphoretic with pale skin. Lung sounds clear bilaterally. Heart sounds regular without murmurs. Abdomen soft, non-tender. No peripheral edema.',
   '{"troponin": "pending", "glucose": "142 mg/dL"}',
   '[
     {"step": 1, "prompt": "What is your first action?", "options": ["Start IV and apply cardiac monitor", "Administer morphine 4mg IV", "Perform 12-lead ECG", "Call for helicopter transport"], "correct": 0, "explanation": "Establishing IV access and cardiac monitoring is essential before administering any medications. This allows you to monitor for arrhythmias and have access for medication administration."},
     {"step": 2, "prompt": "The monitor shows sinus tachycardia at 102 bpm. What is your next step?", "options": ["Administer adenosine 6mg IV", "Perform 12-lead ECG", "Administer amiodarone 150mg IV", "Synchronized cardioversion"], "correct": 1, "explanation": "A 12-lead ECG is critical to identify STEMI and determine the location of the infarction. Sinus tachycardia is an appropriate physiological response to pain and stress."},
     {"step": 3, "prompt": "The 12-lead shows 3mm ST elevation in leads V1-V4 with reciprocal changes in leads II, III, aVF. This indicates:", "options": ["Inferior STEMI", "Anterior STEMI", "Lateral STEMI", "Posterior STEMI"], "correct": 1, "explanation": "ST elevation in V1-V4 indicates an anterior STEMI, typically caused by occlusion of the left anterior descending (LAD) artery. This is a high-risk infarction requiring emergent intervention."},
     {"step": 4, "prompt": "What medications should you administer? (Patient already took aspirin)", "options": ["Nitroglycerin SL and start heparin", "Epinephrine and atropine", "Metoprolol and diltiazem", "Furosemide and morphine"], "correct": 0, "explanation": "For STEMI, give nitroglycerin for pain relief and to reduce preload (if BP allows). Heparin is indicated to prevent further clot propagation. The patient already took aspirin, which is appropriate."}
   ]');
