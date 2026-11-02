export const site = {
  name: 'Daniela Castro',
  title: 'Daniela Castro — Senior Product Designer',
  description:
    'Senior Product Designer from Costa Rica, based in Vienna. 12+ years turning product and business challenges into digital experiences across healthcare, e-commerce and ed-tech.',
  email: 'danielacastroram@gmail.com',
  linkedin: 'https://www.linkedin.com/in/danielacastroram/',
  dribbble: 'https://dribbble.com/dcastro89',
  // Drop your CV into /public as cv.pdf
  cv: 'cv.pdf',
};

export const experience = [
  { company: 'Mimo', role: 'Senior Product Designer', period: 'April 2026 — Current', current: true },
  { company: 'Sirius', role: 'Senior Product Designer', period: 'April 2025 — March 2026', note: '1-year contract' },
  { company: 'GoStudent', role: 'Product Design Lead', period: 'May 2022 — March 2025' },
  { company: 'Lutz Digital', role: 'Senior Product Designer', period: 'April 2021 — April 2022' },
  { company: 'Freelance', role: 'Product Designer', period: 'January 2019 — March 2021' },
  { company: 'Parkside (now Ascent DACH)', role: 'Product Designer', period: 'April 2016 — December 2018' },
  { company: 'Hulihealth', role: 'Junior Product Designer', period: 'April 2014 — March 2016' },
];

export const facts = [
  { text: 'I’m a cat lady', art: 'cat', color: '#D5CCF7' },
  { text: 'I’m from Costa Rica', art: 'cr', color: '#49CC8B' },
  { text: 'Pasta is my favorite food', art: 'pasta', color: '#FFE0B8' },
  { text: 'I fell in love with UX in a hackathon', art: 'hack', color: '#F8F8F8' },
] as const;

export const url = (path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};
