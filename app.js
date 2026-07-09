/* =========================================================
   AAQ Human Biology Calendar Arranger – app.js
   ========================================================= */

import { fetchStateFromFirestore, syncStateToFirestore, generateCalendarId } from './firebase.js';

'use strict';

// ─── Topic Group Definitions ───────────────────────────────
const TOPIC_GROUPS = [
  { id: 'nutrition',    label: 'Nutrition',                                                color: 'hsl(48, 95%, 58%)'  },
  { id: 'cell',         label: 'Cell Biology',                                             color: 'hsl(262, 80%, 65%)' },
  { id: 'topic-area-1', label: 'Topic Area 1: Structure & function of nervous system',     color: 'hsl(205, 85%, 62%)' },
  { id: 'topic-area-2', label: 'Topic Area 2: Neuron communication & control',             color: 'hsl(220, 85%, 62%)' },
  { id: 'topic-area-3', label: 'Topic Area 3: Nociception, neurotransmitters & drugs',     color: 'hsl(235, 85%, 62%)' },
  { id: 'topic-area-4', label: 'Topic Area 4: Diagnosis & treatment of brain disorders',     color: 'hsl(250, 85%, 62%)' },
  { id: 'topic-area-5', label: 'Topic Area 5: Monitoring & scanning the brain',            color: 'hsl(275, 85%, 62%)' },
  { id: 'transport',    label: 'Transport',                                                color: 'hsl(194, 85%, 52%)' },
  { id: 'genetics',     label: 'Genetics & Inheritance',                                   color: 'hsl(142, 72%, 50%)' },
  { id: 'physiology',   label: 'Physiology',                                               color: 'hsl(25, 95%, 60%)'  },
  { id: 'microbes',     label: 'Microorganisms',                                           color: 'hsl(330, 80%, 62%)' },
  { id: 'ecology',      label: 'Ecology & Evolution',                                      color: 'hsl(80, 70%, 48%)'  },
  { id: 'health',       label: 'Health & Disease',                                         color: 'hsl(175, 70%, 48%)' },
  { id: 'revision',     label: 'Revision / Assessment',                                    color: 'hsl(10, 85%, 62%)'  },
  { id: 'nea',          label: 'NEA / Coursework',                                         color: 'hsl(217, 91%, 60%)' },
  { id: 'holiday',      label: 'Holiday / Break',                                          color: 'hsl(0, 0%, 45%)'    },
];

const groupMap = {};
TOPIC_GROUPS.forEach(g => { groupMap[g.id] = g; });

// ─── Calendar Data ─────────────────────────────────────────
// Structure mirrors PDF: each week has up to 5 lesson slots
// Slots: tue1, tue2, weds (NEA), fri1, fri2
// dateLabel: the day-of-month label shown in the "Date" column
const TERMS = [
  {
    id: 'term1',
    label: 'Term 1 – Autumn 2026',
    badge: 'term-1',
    weeks: [
      {
        weekNum: 1, month: 'September', dateLabel: '14th',
        tue1:  { id: 'l1a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l1b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l1c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l1d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: 2, month: 'September', dateLabel: '21st',
        tue1:  { id: 'l2a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l2b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l2c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l2d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: 3, month: 'September', dateLabel: '28th',
        tue1:  { id: 'l3a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l3b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l3c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l3d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: 4, month: 'October', dateLabel: '5th',
        tue1:  { id: 'l4a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l4b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l4c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l4d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: 5, month: 'October', dateLabel: '12th',
        tue1:  { id: 'l5a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l5b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l5c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l5d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: 6, month: 'October', dateLabel: '19th',
        tue1:  { id: 'l6a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l6b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l6c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l6d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: null, month: 'October', dateLabel: '26th',
        isHoliday: true, holidayLabel: 'HALF TERM',
      },
      {
        weekNum: 7, month: 'November', dateLabel: '2nd',
        tue1:  { id: 'l7a', topic: 'Nutrition', group: 'nutrition', notes: '' },
        tue2:  { id: 'l7b', topic: 'Nutrition', group: 'nutrition', notes: '' },
        weds:  null,
        fri1:  { id: 'l7c', topic: 'Nutrition', group: 'nutrition', notes: '' },
        fri2:  { id: 'l7d', topic: 'Nutrition', group: 'nutrition', notes: '' },
      },
      {
        weekNum: 8, month: 'November', dateLabel: '9th',
        tue1:  { id: 'l8a', topic: 'NEA', group: 'nea', notes: '' },
        tue2:  { id: 'l8b', topic: 'NEA', group: 'nea', notes: '' },
        weds:  { id: 'l8w', topic: 'NEA', group: 'nea', notes: '' },
        fri1:  { id: 'l8c', topic: 'NEA', group: 'nea', notes: '' },
        fri2:  { id: 'l8d', topic: 'NEA', group: 'nea', notes: '' },
      },
      {
        weekNum: 9, month: 'November', dateLabel: '16th',
        tue1:  { id: 'l9a', topic: 'NEA', group: 'nea', notes: '' },
        tue2:  { id: 'l9b', topic: 'NEA', group: 'nea', notes: '' },
        weds:  { id: 'l9w', topic: 'NEA', group: 'nea', notes: '' },
        fri1:  { id: 'l9c', topic: 'NEA', group: 'nea', notes: '' },
        fri2:  { id: 'l9d', topic: 'NEA', group: 'nea', notes: '' },
      },
      {
        weekNum: 10, month: 'November', dateLabel: '23rd',
        tue1:  { id: 'l10a', topic: 'NEA', group: 'nea', notes: '' },
        tue2:  { id: 'l10b', topic: 'NEA', group: 'nea', notes: '' },
        weds:  { id: 'l10w', topic: 'NEA', group: 'nea', notes: '' },
        fri1:  { id: 'l10c', topic: 'NEA', group: 'nea', notes: '' },
        fri2:  { id: 'l10d', topic: 'NEA', group: 'nea', notes: '' },
      },
      {
        weekNum: 11, month: 'November', dateLabel: '30th',
        tue1:  { id: 'l11a', topic: 'Lesson 1: Anatomy of the Brain', group: 'topic-area-1', notes: 'Introduction to the key regions of the brain, including the skull, meninges, cerebrum, cerebellum, Hypothalamic-pituitary-adrenal (HPA) axis, and the brain stem (pons, medulla, midbrain)' , criteria: 'P1, P2, P10' },
        tue2:  { id: 'l11b', topic: 'Lesson 2: Modelling Brain Anatomy', group: 'topic-area-1', notes: 'Focus on interpreting photographic scans (CT/MRI). Students practice drawing fully annotated, low-power plan diagrams of transverse and vertical sections of the brain, and discuss the challenges the skull and meninges present during brain surgery' , criteria: 'P1, P2, P10' },
        weds:  null,
        fri1:  { id: 'l11c', topic: 'Lesson 3: The Spinal Cord', group: 'topic-area-1', notes: 'Exploration of the spinal cord\'s transverse section (vertebrae, meninges, grey/white matter, central canal). Discussion of clinical procedures like lumbar punctures, and why cervical breaks are more damaging than lumbar breaks' , criteria: 'D2' },
        fri2:  { id: 'l11d', topic: 'Lesson 4: Nerve Anatomy and Injury', group: 'topic-area-1', notes: 'Microscopic study of cranial and spinal nerves (endoneurium, perineurium, epineurium, fascicles, and myelin sheath). Analysis of how repetitive sports injuries or traumatic injuries lead to a loss of motor and sensory functions' , criteria: 'D2' },
      },
      {
        weekNum: 12, month: 'December', dateLabel: '7th',
        tue1:  { id: 'l12a', topic: 'Lesson 5: Action Potentials', group: 'topic-area-2', notes: 'Detailed study of nerve impulses, covering resting and action potentials, depolarisation, polarisation, and hyperpolarisation' , criteria: 'P3, M2' },
        tue2:  { id: 'l12b', topic: 'Lesson 6: Synaptic Transmission', group: 'topic-area-2', notes: 'The route of neurotransmitters (synthesis, release, recognition, reabsorption). Students will explore how synapses link the nervous system to effectors and the specific relevance of mitochondria in the pre-synaptic knob' , criteria: 'P3, M2' },
        weds:  null,
        fri1:  { id: 'l12c', topic: 'Lesson 7: Drug Impacts on Synapses', group: 'topic-area-2', notes: 'Investigating how different drugs alter synaptic transmission by acting as agonists, antagonists, activators, and inhibitors' , criteria: 'D3' },
        fri2:  { id: 'l12d', topic: 'Lesson 8: Movement and Balance', group: 'topic-area-2', notes: 'Understanding nervous control of the body. Focus on how the motor cortex controls conscious movement, while the cerebellum and proprioceptors (pressure receptors) manage fine motor control and balance' , criteria: 'P3, M2' },
      },
      {
        weekNum: 13, month: 'December', dateLabel: '14th',
        tue1:  { id: 'l13a', topic: 'Lesson 9: Neurotransmitter Dysfunction', group: 'topic-area-3', notes: 'Analysing how a reduction in neurotransmitter function has a direct, negative effect on overall neuron activity' , criteria: 'D3' },
        tue2:  { id: 'l13b', topic: 'Lesson 10: Neurodegenerative Diseases and Seizures', group: 'topic-area-3', notes: 'Applying knowledge of neuron activity to specific conditions. Students will learn how the loss of neurons causes Parkinson’s disease and how interrupted neuron activity results in epileptic seizures' , criteria: 'D3' },
        weds:  { id: 'l13w', topic: 'Non-teaching day', group: 'holiday', notes: '' },
        fri1:  { id: 'l13c', topic: 'Non-teaching day', group: 'holiday', notes: '' },
        fri2:  { id: 'l13d', topic: 'Non-teaching day', group: 'holiday', notes: '' },
      },
      {
        weekNum: null, month: 'December', dateLabel: '21st',
        isHoliday: true, holidayLabel: 'CHRISTMAS',
      },
      {
        weekNum: null, month: 'December', dateLabel: '28th',
        isHoliday: true, holidayLabel: 'CHRISTMAS',
      },
    ]
  },
  {
    id: 'term2',
    label: 'Term 2 – Spring 2027',
    badge: 'term-2',
    weeks: [
      {
        weekNum: 14, month: 'January', dateLabel: '5th',
        tue1:  { id: 'l14a', topic: 'Lesson 11: Communicating Brain Disorders', group: 'topic-area-3', notes: 'Developing science communication skills. Students practice adapting complex scientific information and terminology about brain disorders for non-specialist audiences' , criteria: 'M5, P9, M6' },
        tue2:  { id: 'l14b', topic: 'Lesson 12: Brain Surgery and Ethics', group: 'topic-area-4', notes: 'Examining invasive surgical treatments, including temporary skull removal and modern robotic surgery. Students will also debate the ethical decisions and quality of life considerations tied to brain surgery' , criteria: 'P4, M3, P8, D4' },
        weds:  null,
        fri1:  { id: 'l14c', topic: 'Lesson 13: Therapeutics and Drug Regimes', group: 'topic-area-4', notes: 'Exploring the use of therapeutic drugs to slow disease progress or reduce symptoms, such as the use of L-dopa for Parkinson\'s disease, and designing effective post-operative drug schedules' , criteria: 'P4, M3, P8, D4' },
        fri2:  { id: 'l14d', topic: 'Lesson 14: Rehabilitation and Lifestyle', group: 'topic-area-4', notes: 'Identifying physical and psychological treatments for brain injuries. Students evaluate lifestyle modifications like managed aerobic exercise, rest periods, and the use of medical aids for daily tasks' , criteria: 'P4, M3, M4, P8, D4' },
      },
      {
        weekNum: 15, month: 'January', dateLabel: '12th',
        tue1:  { id: 'l15a', topic: 'Lesson 15: Standard Scanning Techniques', group: 'topic-area-5', notes: 'Evaluating the features, advantages, and disadvantages of using CT, MRI, PET, X-ray, and ultrasound scans to diagnose specific brain disorders or injuries' , criteria: 'M1' },
        tue2:  { id: 'l15b', topic: 'Lesson 16: Specialised Scanning Technologies', group: 'topic-area-5', notes: 'A deep dive into highly specialised imaging used in research and clinical interventions, including functional MRI (fMRI), FIB-SEM, and serial section TEM to observe neuronal circuits' , criteria: 'M1' },
        weds:  null,
        fri1:  { id: 'l15c', topic: 'Lesson 17: Electroencephalogram (EEG) Fundamentals', group: 'topic-area-5', notes: 'Understanding how EEGs detect electrical activity and the transmission of nerve impulses in the brain. This includes knowing why sensors are placed on specific body parts and interpreting the general appearance of readings' , criteria: 'D1' },
        fri2:  { id: 'l15d', topic: 'Lesson 18: Clinical Applications of EEGs & Unit Review', group: 'topic-area-5', notes: 'Discussing how EEGs are practically used to analyse sleep patterns, monitor the "local brain clock," and track a patient\'s post-operative recovery rate' , criteria: 'D1, P11' },
      },
      {
        weekNum: 16, month: 'January', dateLabel: '19th',
        tue1:  { id: 'l16a', topic: 'NEA', group: 'nea', notes: '' },
        tue2:  { id: 'l16b', topic: 'NEA', group: 'nea', notes: '' },
        weds:  { id: 'l16w', topic: 'NEA', group: 'nea', notes: '' },
        fri1:  { id: 'l16c', topic: 'NEA', group: 'nea', notes: '' },
        fri2:  { id: 'l16d', topic: 'NEA', group: 'nea', notes: '' },
      },
      {
        weekNum: 17, month: 'January', dateLabel: '26th',
        tue1:  { id: 'l17a', topic: 'NEA', group: 'nea', notes: '' },
        tue2:  { id: 'l17b', topic: 'NEA', group: 'nea', notes: '' },
        weds:  { id: 'l17w', topic: 'NEA', group: 'nea', notes: '' },
        fri1:  { id: 'l17c', topic: 'NEA', group: 'nea', notes: '' },
        fri2:  { id: 'l17d', topic: 'NEA', group: 'nea', notes: '' },
      },
      {
        weekNum: 18, month: 'February', dateLabel: '2nd',
        tue1:  { id: 'l18a', topic: 'NEA', group: 'nea', notes: '' },
        tue2:  { id: 'l18b', topic: 'NEA', group: 'nea', notes: '' },
        weds:  { id: 'l18w', topic: 'NEA', group: 'nea', notes: '' },
        fri1:  { id: 'l18c', topic: 'NEA', group: 'nea', notes: '' },
        fri2:  { id: 'l18d', topic: 'NEA', group: 'nea', notes: '' },
      },
      {
        weekNum: 19, month: 'February', dateLabel: '9th',
        tue1:  { id: 'l19a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l19b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l19c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l19d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: null, month: 'February', dateLabel: '16th',
        isHoliday: true, holidayLabel: 'HALF TERM',
      },
      {
        weekNum: 20, month: 'February', dateLabel: '23rd',
        tue1:  { id: 'l20a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l20b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l20c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l20d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 21, month: 'March', dateLabel: '2nd',
        tue1:  { id: 'l21a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l21b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l21c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l21d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 22, month: 'March', dateLabel: '9th',
        tue1:  { id: 'l22a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l22b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l22c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l22d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 23, month: 'March', dateLabel: '16th',
        tue1:  { id: 'l23a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l23b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l23c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l23d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 24, month: 'March', dateLabel: '23rd',
        tue1:  { id: 'l24a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l24b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l24c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l24d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: null, month: 'March', dateLabel: '30th',
        isHoliday: true, holidayLabel: 'EASTER',
      },
      {
        weekNum: null, month: 'April', dateLabel: '6th',
        isHoliday: true, holidayLabel: 'EASTER',
      },
    ]
  },
  {
    id: 'term3',
    label: 'Term 3 – Summer 2027',
    badge: 'term-3',
    weeks: [
      {
        weekNum: 25, month: 'April', dateLabel: '13th',
        tue1:  { id: 'l25a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l25b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l25c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l25d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 26, month: 'April', dateLabel: '20th',
        tue1:  { id: 'l26a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l26b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l26c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l26d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 27, month: 'April', dateLabel: '27th',
        tue1:  { id: 'l27a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l27b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l27c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l27d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 28, month: 'May', dateLabel: '4th',
        tue1:  { id: 'l28a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l28b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l28c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l28d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 29, month: 'May', dateLabel: '11th',
        tue1:  { id: 'l29a', topic: 'Health & Disease', group: 'health', notes: '' },
        tue2:  { id: 'l29b', topic: 'Health & Disease', group: 'health', notes: '' },
        weds:  null,
        fri1:  { id: 'l29c', topic: 'Health & Disease', group: 'health', notes: '' },
        fri2:  { id: 'l29d', topic: 'Health & Disease', group: 'health', notes: '' },
      },
      {
        weekNum: 30, month: 'May', dateLabel: '18th',
        tue1:  { id: 'l30a', topic: 'Revision', group: 'revision', notes: '' },
        tue2:  { id: 'l30b', topic: 'Revision', group: 'revision', notes: '' },
        weds:  null,
        fri1:  { id: 'l30c', topic: 'Revision', group: 'revision', notes: '' },
        fri2:  { id: 'l30d', topic: 'Revision', group: 'revision', notes: '' },
      },
      {
        weekNum: 31, month: 'May', dateLabel: '25th',
        tue1:  { id: 'l31a', topic: 'Revision', group: 'revision', notes: '' },
        tue2:  { id: 'l31b', topic: 'Revision', group: 'revision', notes: '' },
        weds:  null,
        fri1:  { id: 'l31c', topic: 'Revision', group: 'revision', notes: '' },
        fri2:  { id: 'l31d', topic: 'Revision', group: 'revision', notes: '' },
      },
      {
        weekNum: null, month: 'June', dateLabel: '1st',
        isHoliday: true, holidayLabel: 'HALF TERM',
      },
    ]
  }
];

// Lesson slot keys in column order
const SLOT_KEYS   = ['tue1', 'tue2', 'weds', 'fri1', 'fri2'];
const SLOT_LABELS = ['Tuesday', 'Tuesday', 'Weds NEA', 'Friday', 'Friday'];

// ─── State ─────────────────────────────────────────────────
const STORAGE_KEY = 'aaq-bio-calendar-v3';
let state = { terms: null };
let editTarget = null; // { termIdx, weekIdx, slot }
let draggedSource = null; // { termIdx, weekIdx, slot }

// ─── Theme ─────────────────────────────────────────────────
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('aaq-bio-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('aaq-bio-theme', 'dark');
  }
}

function loadTheme() {
  const storedTheme = localStorage.getItem('aaq-bio-theme');
  if (storedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// ─── Persistence ───────────────────────────────────────────
let currentCalendarId = null;
let saveTimeout = null;

async function loadState() {
  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get('id');
  
  if (idFromUrl) {
    currentCalendarId = idFromUrl;
    // try to load from firebase
    const remoteState = await fetchStateFromFirestore(currentCalendarId);
    if (remoteState && remoteState.terms && Array.isArray(remoteState.terms)) {
      state.terms = remoteState.terms;
      return;
    } else {
      showToast('Could not load remote calendar. Loading default.', 'error');
    }
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.terms && Array.isArray(parsed.terms)) {
        state.terms = parsed.terms;
        return;
      }
    }
  } catch (e) { /* ignore */ }
  state.terms = JSON.parse(JSON.stringify(TERMS));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ terms: state.terms }));
  } catch (e) { /* storage full – silent fail */ }
  
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    if (!currentCalendarId) {
      currentCalendarId = generateCalendarId();
      const url = new URL(window.location);
      url.searchParams.set('id', currentCalendarId);
      window.history.replaceState({}, '', url);
    }
    await syncStateToFirestore(currentCalendarId, { terms: state.terms });
  }, 1000);
}

// ─── DOM Helpers ───────────────────────────────────────────
function el(tag, cls, attrs = {}) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'textContent') e.textContent = v;
    else if (k === 'innerHTML') e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  return e;
}

// ─── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = el('div', `toast ${type}`, { textContent: msg });
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3000);
}

// ─── Legend ────────────────────────────────────────────────
function buildLegend() {
  const itemsEl = document.getElementById('legend-items');
  itemsEl.innerHTML = '';
  TOPIC_GROUPS.filter(g => g.id !== 'holiday').forEach(group => {
    const item = el('li', 'legend-item', { role: 'listitem' });
    const dot = el('span', 'legend-dot');
    dot.style.background = group.color;
    dot.style.boxShadow = `0 0 6px ${group.color}`;
    item.appendChild(dot);
    item.appendChild(document.createTextNode(group.label));
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', group.label);
    itemsEl.appendChild(item);
  });
}

// ─── Lesson Cell Builder ────────────────────────────────────
function buildLessonCell(lesson, termIdx, weekIdx, slot) {
  const td = el('td', 'lesson-cell');

  td.dataset.termIdx  = termIdx;
  td.dataset.weekIdx  = weekIdx;
  td.dataset.slot     = slot;

  if (lesson) {
    td.setAttribute('draggable', 'true');
    td.addEventListener('dragstart', (e) => {
      draggedSource = { termIdx, weekIdx, slot };
      setTimeout(() => td.classList.add('dragging'), 0);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', lesson.topic);
    });
    td.addEventListener('dragend', () => {
      td.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      draggedSource = null;
    });
  }

  td.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  td.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (draggedSource && (draggedSource.termIdx !== termIdx || draggedSource.weekIdx !== weekIdx || draggedSource.slot !== slot)) {
      td.classList.add('drag-over');
    }
  });

  td.addEventListener('dragleave', () => {
    td.classList.remove('drag-over');
  });

  td.addEventListener('drop', (e) => {
    e.preventDefault();
    td.classList.remove('drag-over');
    if (!draggedSource) return;
    if (draggedSource.termIdx === termIdx && draggedSource.weekIdx === weekIdx && draggedSource.slot === slot) return;

    const src = draggedSource;
    const temp = state.terms[termIdx].weeks[weekIdx][slot];
    state.terms[termIdx].weeks[weekIdx][slot] = state.terms[src.termIdx].weeks[src.weekIdx][src.slot];
    state.terms[src.termIdx].weeks[src.weekIdx][src.slot] = temp;

    draggedSource = null;
    saveState();
    renderCalendar();
    showToast('Lesson moved successfully');
  });

  if (!lesson) {
    td.classList.add('lesson-cell--empty');
    return td;
  }

  const group = groupMap[lesson.group] || groupMap['revision'];
  td.style.setProperty('--topic-color', group.color);

  // Coloured left-border accent is applied via CSS class
  td.classList.add('lesson-cell--filled');

  const inner = el('div', 'cell-inner');

  const topicEl = el('div', 'cell-topic', { textContent: lesson.topic });
  inner.appendChild(topicEl);

  const tagEl = el('span', 'cell-tag', { textContent: group.label });
  tagEl.style.setProperty('--topic-color', group.color);
  inner.appendChild(tagEl);

  if (lesson.criteria) {
    const criteriaEl = el('div', 'cell-criteria', { textContent: lesson.criteria });
    inner.appendChild(criteriaEl);
  }

  if (lesson.notes) {
    const notesEl = el('div', 'cell-notes', { textContent: lesson.notes });
    inner.appendChild(notesEl);
  }

  // Edit button (shown on hover)
  const editBtn = el('button', 'cell-edit-btn', { title: 'Edit lesson', 'aria-label': `Edit ${lesson.topic}` });
  editBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(termIdx, weekIdx, slot);
  });
  inner.appendChild(editBtn);

  td.appendChild(inner);

  td.setAttribute('tabindex', '0');
  td.setAttribute('role', 'button');
  td.setAttribute('aria-label', `${lesson.topic} – ${group.label}. Click to edit.`);
  td.addEventListener('click', () => openEditModal(termIdx, weekIdx, slot));
  td.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditModal(termIdx, weekIdx, slot); }
  });

  return td;
}

// ─── Calendar Renderer ─────────────────────────────────────
function renderCalendar() {
  const container = document.getElementById('calendar-container');
  container.innerHTML = '';

  state.terms.forEach((term, termIdx) => {
    const section = el('section', 'term-section');
    section.setAttribute('aria-labelledby', `term-title-${termIdx}`);

    // Term header
    const header = el('div', 'term-header');
    const titleEl = el('h2', 'term-title', { id: `term-title-${termIdx}`, textContent: term.label });
    const badge = el('span', `term-badge ${term.badge}`, {
      textContent: term.badge.replace('-', ' ').toUpperCase()
    });
    const weekCount = el('span', 'term-week-count', {
      textContent: `${term.weeks.filter(w => !w.isHoliday).length} teaching weeks`
    });
    const badgeRow = el('div', 'term-badge-row');
    badgeRow.appendChild(badge);
    badgeRow.appendChild(weekCount);
    header.appendChild(titleEl);
    header.appendChild(badgeRow);
    section.appendChild(header);

    // Build the table
    const tableWrapper = el('div', 'table-wrapper');
    const table = el('table', 'cal-table');
    table.setAttribute('role', 'grid');
    table.setAttribute('aria-label', `${term.label} calendar`);

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Fixed header columns
    const thWeek = el('th', 'th-week', { scope: 'col', textContent: 'Week' });
    const thMonth = el('th', 'th-month', { scope: 'col', textContent: 'Month' });
    const thDate = el('th', 'th-date', { scope: 'col', textContent: 'Date' });

    // Grouped Tuesday header
    const thTueGroup = el('th', 'th-day-group', { scope: 'colgroup', textContent: 'Tuesday' });
    thTueGroup.setAttribute('colspan', '2');

    // Weds NEA
    const thWeds = el('th', 'th-day-nea', { scope: 'col', textContent: 'Weds NEA session' });

    // Grouped Friday header
    const thFriGroup = el('th', 'th-day-group', { scope: 'colgroup', textContent: 'Friday' });
    thFriGroup.setAttribute('colspan', '2');

    headerRow.appendChild(thWeek);
    headerRow.appendChild(thMonth);
    headerRow.appendChild(thDate);
    headerRow.appendChild(thTueGroup);
    headerRow.appendChild(thWeds);
    headerRow.appendChild(thFriGroup);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');

    // Group consecutive rows by month for rowspan
    // Pre-compute month groups
    const monthGroups = [];
    let curMonth = null, curStart = 0;
    term.weeks.forEach((week, i) => {
      if (week.month !== curMonth) {
        if (curMonth !== null) monthGroups.push({ month: curMonth, start: curStart, end: i - 1 });
        curMonth = week.month;
        curStart = i;
      }
      if (i === term.weeks.length - 1) monthGroups.push({ month: curMonth, start: curStart, end: i });
    });

    // Build a lookup: weekIndex → monthGroup info
    const monthRowspan = {};
    monthGroups.forEach(g => {
      const span = g.end - g.start + 1;
      for (let i = g.start; i <= g.end; i++) {
        if (i === g.start) {
          monthRowspan[i] = { first: true, span };
        } else {
          monthRowspan[i] = { first: false, span: 0 };
        }
      }
    });

    term.weeks.forEach((week, weekIdx) => {
      const tr = document.createElement('tr');

      // Week number cell
      if (week.isHoliday) {
        // For holiday rows: week num cell is blank/grey
        const tdWk = el('td', 'td-week td-week--holiday');
        tr.appendChild(tdWk);
      } else {
        const tdWk = el('td', 'td-week');
        tdWk.textContent = week.weekNum;
        tr.appendChild(tdWk);
      }

      // Month cell (rowspan per month group)
      const mInfo = monthRowspan[weekIdx];
      if (mInfo && mInfo.first) {
        const tdMonth = el('td', 'td-month');
        tdMonth.setAttribute('rowspan', mInfo.span);
        const monthSpan = el('span', 'month-label', { textContent: week.month });
        tdMonth.appendChild(monthSpan);
        tr.appendChild(tdMonth);
      }

      // Date cell
      const tdDate = el('td', 'td-date');
      tdDate.textContent = week.dateLabel;
      if (week.isHoliday) tdDate.classList.add('td-date--holiday');
      tr.appendChild(tdDate);

      if (week.isHoliday) {
        // Holiday row: span all 5 lesson columns
        tr.classList.add('tr-holiday');
        const tdHoliday = el('td', 'td-holiday-label');
        tdHoliday.setAttribute('colspan', '5');
        tdHoliday.textContent = week.holidayLabel;
        tr.appendChild(tdHoliday);
      } else {
        // Regular lesson row
        SLOT_KEYS.forEach(slot => {
          const lessonCell = buildLessonCell(week[slot], termIdx, weekIdx, slot);
          if (slot === 'weds') lessonCell.classList.add('lesson-cell--nea');
          tr.appendChild(lessonCell);
        });
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    section.appendChild(tableWrapper);
    container.appendChild(section);
  });
}

// ─── Edit Modal ────────────────────────────────────────────
function buildGroupSelect() {
  const sel = document.getElementById('edit-group');
  sel.innerHTML = '';
  TOPIC_GROUPS.filter(g => g.id !== 'holiday').forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.label;
    sel.appendChild(opt);
  });
}

function openEditModal(termIdx, weekIdx, slot) {
  const week = state.terms[termIdx].weeks[weekIdx];
  if (week.isHoliday) return;
  const lesson = week[slot];
  if (!lesson) return;

  editTarget = { termIdx, weekIdx, slot };

  document.getElementById('edit-topic').value = lesson.topic;
  document.getElementById('edit-group').value = lesson.group;
  document.getElementById('edit-criteria').value = lesson.criteria || '';
  document.getElementById('edit-notes').value = lesson.notes || '';

  const modal = document.getElementById('edit-modal');
  modal.hidden = false;
  modal.removeAttribute('hidden');
  document.getElementById('edit-topic').focus();
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  modal.hidden = true;
  modal.setAttribute('hidden', '');
  editTarget = null;
}

function saveEdit() {
  if (!editTarget) return;
  const { termIdx, weekIdx, slot } = editTarget;
  const lesson = state.terms[termIdx].weeks[weekIdx][slot];

  const newTopic = document.getElementById('edit-topic').value.trim();
  const newGroup = document.getElementById('edit-group').value;
  const newCriteria = document.getElementById('edit-criteria').value.trim();
  const newNotes = document.getElementById('edit-notes').value.trim();

  if (!newTopic) {
    const inp = document.getElementById('edit-topic');
    inp.focus();
    inp.style.borderColor = 'hsl(10,85%,62%)';
    return;
  }

  lesson.topic = newTopic;
  lesson.group = newGroup;
  lesson.criteria = newCriteria;
  lesson.notes = newNotes;

  saveState();
  closeEditModal();
  renderCalendar();
  showToast('Lesson updated successfully');
}

// ─── Export CSV ────────────────────────────────────────────
function exportCSV() {
  const rows = [['Term', 'Week', 'Month', 'Date', 'Slot', 'Topic', 'Topic Group', 'Notes', 'Assessment Criteria']];
  state.terms.forEach(term => {
    term.weeks.forEach(week => {
      if (week.isHoliday) {
        rows.push([term.label, '', week.month, week.dateLabel, 'HOLIDAY', week.holidayLabel, '', '', '']);
        return;
      }
      SLOT_KEYS.forEach((slot, i) => {
        const lesson = week[slot];
        if (!lesson) return;
        const group = groupMap[lesson.group];
        rows.push([
          term.label,
          `Week ${week.weekNum}`,
          week.month,
          week.dateLabel,
          SLOT_LABELS[i],
          lesson.topic,
          group ? group.label : lesson.group,
          lesson.notes || '',
          lesson.criteria || ''
        ]);
      });
    });
  });

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AAQ_HumanBiology_Calendar_2026-27.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Calendar exported as CSV');
}

// ─── Export Word ───────────────────────────────────────────
// ─── Export Word ───────────────────────────────────────────
function exportWord() {
  const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Programme Calendar</title>
  <style>
    @page WordSection1 {
      size: 841.9pt 595.3pt; /* A4 Landscape */
      mso-page-orientation: landscape;
      margin: 36.0pt 36.0pt 36.0pt 36.0pt;
    }
    div.WordSection1 { page: WordSection1; }
    body { font-family: 'Arial', sans-serif; color: #000; margin: 0; text-align: center; }
    
    h1 { font-size: 18pt; font-weight: bold; margin-bottom: 2pt; margin-top: 0; font-family: 'Arial', sans-serif; }
    h2 { font-size: 12pt; font-weight: bold; margin-top: 0; margin-bottom: 20pt; font-family: 'Arial', sans-serif; }
    
    /* Overview Table */
    .overview-table { width: 80%; margin: 0 auto 30px auto; border-collapse: collapse; font-size: 9pt; font-family: 'Arial', sans-serif; }
    .overview-table th, .overview-table td { border: 1px solid #000; padding: 6px; text-align: center; vertical-align: middle; }
    
    /* Main Calendar Table */
    .cal-table { width: 100%; border-collapse: collapse; font-size: 9pt; font-family: 'Arial', sans-serif; }
    .cal-table th, .cal-table td { border: 1px solid #000; padding: 6px 4px; vertical-align: middle; text-align: center; }
    .cal-table th { font-weight: bold; background-color: #ffffff; }
    
    .td-week { font-weight: bold; width: 4%; background-color: #ffffff; }
    .td-date { width: 6%; background-color: #ffffff; }
    .td-month { 
      font-weight: bold; 
      width: 6%; 
      background-color: #ffffff; 
      writing-mode: tb-rl; 
      mso-write: 3; 
      white-space: nowrap;
    }
    
    /* Topic Background Colors (Mirroring PDF exactly) */
    .cell-nutrition { background-color: #ffe599; }
    .cell-brain { background-color: #bdd7ee; } /* light blue */
    .cell-health { background-color: #a4c2f4; } /* light blue */
    .cell-nea { background-color: #ffe599; font-weight: bold; }
    
    .cell-holiday { background-color: #d9d9d9; font-weight: bold; }
    .cell-empty { background-color: #d9d9d9; }
    
    .holiday-row td { background-color: #d9d9d9; font-weight: bold; }
    .holiday-row td.td-month { background-color: #ffffff; }
  </style>
  </head><body><div class='WordSection1'>
  <h1>AAQ Human Biology Calendar 2026-2027</h1>
  <h2>Overview</h2>
  
  <table class="overview-table">
    <thead>
      <tr>
        <th rowspan="2" style="background-color: #ffe599;">Unit</th>
        <th colspan="2" style="background-color: #ffe599;">Taught</th>
        <th colspan="2" style="background-color: #ffe599;">NEA</th>
        <th colspan="2" style="background-color: #ffe599;">Total</th>
      </tr>
      <tr>
        <th style="background-color: #ffe599;">GLH</th>
        <th style="background-color: #ffe599;">Mine</th>
        <th style="background-color: #ffe599;">GLH</th>
        <th style="background-color: #ffe599;">Mine</th>
        <th style="background-color: #ffe599;">GLH</th>
        <th style="background-color: #ffe599;">Mine</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background-color: #ffe599;">
        <td style="text-align: left; font-weight: bold;">Nutrition & Metabolism (NEA)</td>
        <td>35</td>
        <td>35</td>
        <td>15</td>
        <td>15</td>
        <td>50</td>
        <td>50</td>
      </tr>
      <tr style="background-color: #c6e0b4;">
        <td style="text-align: left; font-weight: bold;">The Brain (NEA)</td>
        <td>26</td>
        <td>22.5</td>
        <td>24</td>
        <td>22.5</td>
        <td>50</td>
        <td>45</td>
      </tr>
      <tr style="background-color: #b4c6e7;">
        <td style="text-align: left; font-weight: bold;">Health & Disease (Exam)</td>
        <td>80</td>
        <td>52.5</td>
        <td>0</td>
        <td>0</td>
        <td>80</td>
        <td>52.5</td>
      </tr>
    </tbody>
  </table>
  
  <table class="cal-table">
    <thead>
      <tr>
        <th colspan="3" style="width: 16%;">Week/Date</th>
        <th colspan="2" style="width: 40%;">Tuesday</th>
        <th style="width: 12%;">Weds NEA session</th>
        <th colspan="2" style="width: 32%;">Friday</th>
      </tr>
    </thead>
    <tbody>`;

  // Flatten weeks list
  const allWeeks = [];
  state.terms.forEach(term => {
    allWeeks.push(...term.weeks);
  });

  // Precompute Month rowspan
  const monthGroups = [];
  let curMonth = null, curStart = 0;
  allWeeks.forEach((week, i) => {
    if (week.month !== curMonth) {
      if (curMonth !== null) monthGroups.push({ month: curMonth, start: curStart, end: i - 1 });
      curMonth = week.month;
      curStart = i;
    }
    if (i === allWeeks.length - 1) monthGroups.push({ month: curMonth, start: curStart, end: i });
  });

  const monthRowspan = {};
  monthGroups.forEach(g => {
    const span = g.end - g.start + 1;
    for (let i = g.start; i <= g.end; i++) {
      if (i === g.start) {
        monthRowspan[i] = { first: true, span };
      } else {
        monthRowspan[i] = { first: false, span: 0 };
      }
    }
  });

  let body = '';
  allWeeks.forEach((week, i) => {
    const isHoliday = week.isHoliday;
    const trCls = isHoliday ? 'class="holiday-row"' : '';
    body += `<tr ${trCls}>`;

    // 1. Week number cell
    if (isHoliday) {
      body += `<td class="td-week"></td>`;
    } else {
      body += `<td class="td-week">${week.weekNum || ''}</td>`;
    }

    // 2. Month cell (rowspan)
    const mInfo = monthRowspan[i];
    if (mInfo && mInfo.first) {
      body += `<td class="td-month" rowspan="${mInfo.span}">${week.month}</td>`;
    }

    // 3. Date cell
    body += `<td class="td-date">${week.dateLabel}</td>`;

    // 4. Lesson cells / Holiday label
    if (isHoliday) {
      body += `<td colspan="5" class="cell-holiday">${week.holidayLabel}</td>`;
    } else {
      SLOT_KEYS.forEach(slot => {
        const lesson = week[slot];
        if (!lesson) {
          body += `<td class="cell-empty"></td>`;
        } else {
          let cellCls = '';
          let text = lesson.topic;

          if (lesson.group === 'nutrition') {
            cellCls = 'cell-nutrition';
          } else if (lesson.group === 'cell' || lesson.group.startsWith('topic-area-')) { // Brain
            cellCls = 'cell-brain';
          } else if (lesson.group === 'health') {
            cellCls = 'cell-health';
          } else if (lesson.group === 'nea') {
            cellCls = 'cell-nea';
          } else if (lesson.group === 'holiday') {
            cellCls = 'cell-holiday';
          } else if (lesson.group === 'revision') {
            cellCls = 'cell-holiday'; // revision is grey in PDF
          }

          body += `<td class="${cellCls}">${text}</td>`;
        }
      });
    }
    body += `</tr>`;
  });

  body += `</tbody></table>`;

  const footer = `</div></body></html>`;
  const html = header + body + footer;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AAQ_HumanBiology_Calendar_2026-27.doc';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Calendar exported as Word document');
}

// ─── Reset ─────────────────────────────────────────────────
function resetCalendar() {
  if (!confirm('Reset the calendar to the original order? This cannot be undone.')) return;
  state.terms = JSON.parse(JSON.stringify(TERMS));
  saveState();
  renderCalendar();
  showToast('Calendar reset to original order', 'info');
}

// ─── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditModal();
});

// ─── Init ──────────────────────────────────────────────────
async function init() {
  loadTheme();
  await loadState();
  buildLegend();
  buildGroupSelect();
  renderCalendar();

  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-export').addEventListener('click', exportCSV);
  document.getElementById('btn-export-word').addEventListener('click', exportWord);
  document.getElementById('btn-reset').addEventListener('click', resetCalendar);
  document.getElementById('btn-print').addEventListener('click', () => window.print());

  document.getElementById('modal-close').addEventListener('click', closeEditModal);
  document.getElementById('modal-cancel').addEventListener('click', closeEditModal);
  document.getElementById('modal-save').addEventListener('click', saveEdit);

  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  document.getElementById('edit-topic').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    e.currentTarget.style.borderColor = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
