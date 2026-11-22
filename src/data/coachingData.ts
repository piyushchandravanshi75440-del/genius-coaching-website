export interface CourseInfo {
  id: string;
  classGrade: string;
  title: string;
  subjects: string[];
  description: string;
  features: string[];
  boardNotice: string;
  whatsappMessage: string;
}

export interface WhyFeature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  detail: string;
}

export interface LearningStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  focus: string;
}

export interface ProgressMetric {
  title: string;
  label: string;
  description: string;
  metricType: string;
  frequency: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Classroom Teaching' | 'Tests' | 'Students Studying' | 'Doubt Solving' | 'Coaching Centre';
  imageSrc?: string;
  isPlaceholder?: boolean;
  caption: string;
}

export interface ReferralTier {
  friends: number;
  reward: string;
  badge: string;
  detail: string;
}

export interface ReviewPlaceholder {
  id: string;
  name: string;
  role: string;
  classTag: string;
  quote: string;
  isVerifiedPlaceholder?: boolean;
  rating?: number;
  highlightTag?: string;
  location?: string;
  avatarInitials?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const BRAND_INFO = {
  name: 'GENIUS COACHING CENTRE',
  acronym: 'GCC',
  tagline: 'LEARN • PRACTICE • SUCCEED',
  motto: 'Empowering Minds • Fostering Success',
  trustStatement: 'Focused Learning • Regular Practice • Better Preparation',
  classes: 'Class 9 & Class 10',
  boards: 'BSEB & CBSE',
  subjects: 'Mathematics • Science • Social Science • Sanskrit (BSEB)',
  phone: '8102072380',
  phoneDisplay: '+91 81020 72380',
  location: 'Sundar Nagar Colony, Ward No. 2, Bhabua, Kaimur, Bihar',
  addressLine: 'Sundar Nagar Colony, Ward No. 2, Bhabua, Kaimur, Bihar – 821101',
  whatsappBaseUrl: 'https://wa.me/918102072380',
  defaultWhatsappMessage: 'Hello Genius Coaching Centre, I want to enquire about admission for Class 9/10.',
  admissionBanner: {
    heading: 'NEW SESSION ADMISSIONS OPEN',
    subheading: 'Admissions for Class 9 & 10',
    ctaText: 'Enquire now for admission details.',
    buttonText: 'Get Admission Information',
  },
};

export const COURSES_DATA: CourseInfo[] = [
  {
    id: 'class-9',
    classGrade: 'CLASS 9',
    title: 'Foundational Mastery for Class 9',
    subjects: [
      'Mathematics',
      'Science (Physics, Chemistry, Biology)',
      'Social Science (History, Civics, Geography, Economics)',
      'Sanskrit (Dedicated Bihar Board BSEB Curriculum & Grammar)',
    ],
    description: 'Build strong fundamentals and develop consistent study habits.',
    features: [
      'Concept clarity from basic to advanced levels',
      'Specialized Sanskrit vyakaran (grammar) & textbook preparation for BSEB',
      'Regular homework checking & question practice',
      'Chapter-wise weekly diagnostic tests',
      'Dedicated doubt solving support',
    ],
    boardNotice: 'BSEB & CBSE Curriculum Aligned',
    whatsappMessage: 'Hello Genius Coaching Centre, I want to enquire about admission for Class 9 (BSEB / CBSE).',
  },
  {
    id: 'class-10',
    classGrade: 'CLASS 10',
    title: 'Board Exam Preparation for Class 10',
    subjects: [
      'Mathematics',
      'Science (Physics, Chemistry, Biology)',
      'Social Science (History, Civics, Geography, Economics)',
      'Sanskrit (Scoring BSEB Board Syllabus, Vyakaran & Model Papers)',
    ],
    description: 'Focused preparation with regular practice and board-oriented learning.',
    features: [
      'Comprehensive syllabus coverage per BSEB & CBSE board blueprints',
      'Targeted Sanskrit scoring strategy (objective questions + subjectivity answers for BSEB)',
      'Extensive previous year question (PYQ) practice',
      'Timed full-syllabus mock tests and evaluation',
      'Step-wise answer writing guidance for maximum marks',
    ],
    boardNotice: 'BSEB & CBSE Board Exam Preparation',
    whatsappMessage: 'Hello Genius Coaching Centre, I want to enquire about admission for Class 10 (BSEB / CBSE).',
  },
];

export const WHY_GENIUS_FEATURES: WhyFeature[] = [
  {
    id: 'regular-tests',
    title: 'Regular Tests',
    description: 'Practice regularly and understand your preparation level.',
    iconName: 'ClipboardCheck',
    detail: 'Weekly chapter assessments and cumulative monthly evaluations to track readiness before exams.',
  },
  {
    id: 'doubt-solving',
    title: 'Doubt Solving',
    description: 'Get help with difficult concepts and questions.',
    iconName: 'HelpCircle',
    detail: 'Structured query time where students can resolve specific roadblocks without hesitation.',
  },
  {
    id: 'board-focused',
    title: 'Board-Focused Preparation',
    description: 'Prepare systematically for BSEB and CBSE examinations.',
    iconName: 'Target',
    detail: 'Tailored study approaches designed around exact marking schemes and question patterns.',
  },
  {
    id: 'personal-attention',
    title: 'Personal Attention',
    description: 'Identify learning gaps and work on improvement.',
    iconName: 'UserCheck',
    detail: 'Close observation of each student to understand conceptual weak points and strengthen them.',
  },
  {
    id: 'consistent-practice',
    title: 'Consistent Practice',
    description: 'Build confidence through regular question practice.',
    iconName: 'Sparkles',
    detail: 'Daily problem-solving routines that turn textbook theories into exam confidence.',
  },
];

export const LEARNING_STEPS: LearningStep[] = [
  {
    step: '01',
    title: 'LEARN',
    subtitle: 'Clear Concepts',
    description: 'Understand the concept clearly.',
    focus: 'In-depth classroom explanation with practical examples and clear step-by-step notes.',
  },
  {
    step: '02',
    title: 'PRACTICE',
    subtitle: 'Solve Questions',
    description: 'Solve questions regularly.',
    focus: 'Graded textbook exercises, numerical solving, and theoretical answer structuring.',
  },
  {
    step: '03',
    title: 'TEST',
    subtitle: 'Evaluate Progress',
    description: 'Check your preparation.',
    focus: 'Periodic chapter tests under exam conditions to measure retention and speed.',
  },
  {
    step: '04',
    title: 'IMPROVE',
    subtitle: 'Target Gaps',
    description: 'Identify mistakes and improve.',
    focus: 'One-on-one feedback, correction of recurring errors, and doubt resolution.',
  },
];

export const PROGRESS_CARDS: ProgressMetric[] = [
  {
    title: 'Weekly Tests',
    label: 'Continuous Assessment',
    description: 'Scheduled Sunday tests on completed topics to build disciplined exam stamina.',
    metricType: 'Sunday Evaluation',
    frequency: 'Every Week',
  },
  {
    title: 'Subject-wise Performance',
    label: 'Granular Breakdown',
    description: 'Individual monitoring in Mathematics, Science (PCB), SST, and dedicated Sanskrit (BSEB).',
    metricType: 'Topic-by-Topic Clarity',
    frequency: 'Monthly Reviews',
  },
  {
    title: 'Practice Progress',
    label: 'Worksheet & Homework',
    description: 'Monitoring daily homework completion, NCERT problem sets, and revision sheets.',
    metricType: 'Regular Exercise Logs',
    frequency: 'Daily Routine',
  },
  {
    title: 'Improvement Tracking',
    label: 'Error Analysis',
    description: 'Identifying calculation slips, concept lapses, and formatting issues for correction.',
    metricType: 'Actionable Remediation',
    frequency: 'Post-Test Follow-up',
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gallery-1',
    title: 'Interactive Board Explanation',
    category: 'Classroom Teaching',
    imageSrc: '/src/assets/images/hero_classroom_coaching_1790574506076.jpg',
    isPlaceholder: false,
    caption: 'Concept-first teaching for Class 9 & 10 Mathematics and Science.',
  },
  {
    id: 'gallery-2',
    title: 'Dedicated Doubt Clearing Desk',
    category: 'Doubt Solving',
    imageSrc: '/src/assets/images/doubt_solving_guidance_1790574532657.jpg',
    isPlaceholder: false,
    caption: 'One-on-one teacher guidance on challenging numericals and concepts.',
  },
  {
    id: 'gallery-3',
    title: 'Focused Classroom Session',
    category: 'Students Studying',
    imageSrc: '/src/assets/images/classroom_teaching_session_1790574517358.jpg',
    isPlaceholder: false,
    caption: 'Quiet, disciplined study environment conducive to academic excellence.',
  },
  {
    id: 'gallery-4',
    title: 'Sunday Mock & Chapter Test Session',
    category: 'Tests',
    isPlaceholder: true,
    caption: 'Simulated examination conditions for BSEB & CBSE board readiness.',
  },
  {
    id: 'gallery-5',
    title: 'Bhabua Coaching Premises',
    category: 'Coaching Centre',
    isPlaceholder: true,
    caption: 'Convenient, central learning center location in Bhabua, Kaimur.',
  },
  {
    id: 'gallery-6',
    title: 'NCERT & PYQ Discussion Hours',
    category: 'Classroom Teaching',
    isPlaceholder: true,
    caption: 'Rigorous solution discussion of previous years board papers.',
  },
];

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    friends: 1,
    reward: 'Special Study Material',
    badge: '1 Friend Joined',
    detail: 'Curated chapter summary notes and formula sheets for Class 9 or 10.',
  },
  {
    friends: 2,
    reward: 'Premium Question Bank',
    badge: '2 Friends Joined',
    detail: 'Handpicked high-yield questions and previous year question bank with solutions.',
  },
  {
    friends: 3,
    reward: '1 Month Test Series',
    badge: '3 Friends Joined',
    detail: 'Full 1-month access to weekly chapter and composite evaluation tests with feedback.',
  },
  {
    friends: 5,
    reward: 'Genius Star Certificate + Special Reward',
    badge: '5 Friends Joined',
    detail: 'Official Genius Star Scholar citation plus an exclusive academic gift reward.',
  },
];

export const TESTIMONIAL_PLACEHOLDERS: ReviewPlaceholder[] = [
  {
    id: 'parent-1',
    name: 'Rameshwar Singh',
    role: 'Parent of Aditya Kumar',
    classTag: 'Class 10 (BSEB)',
    location: 'Ward No. 6, Bhabua',
    rating: 5,
    highlightTag: 'Marks 60% se 88% Tak Sudhar',
    avatarInitials: 'RS',
    quote: 'Hamare bete ka Maths aur Science pehle kafi kamzor tha. Genius Coaching Centre me admission dilwane ke baad teachers ne basic concepts itne ache se samjhaye ki tests me uska result lagatar behtar hota gaya. Weekly tests aur regular doubt sessions se uska darr poori tarah khatam ho gaya. Bhabua me Class 10 ke liye sabse vishwasniya coaching hai.',
    isVerifiedPlaceholder: false,
  },
  {
    id: 'parent-2',
    name: 'Sunita Devi',
    role: 'Parent of Priya Kumari',
    classTag: 'Class 10 (CBSE)',
    location: 'Civil Lines, Bhabua',
    rating: 5,
    highlightTag: 'Board Exam Confidence & Doubts',
    avatarInitials: 'SD',
    quote: 'Class 10 board exams ko lekar hume kafi chinta thi. Genius Coaching ke experienced teachers ne har subject — Science, Maths aur Social Science par bariki se mehnat karwayi. Weekly mock test se Priya ka time management aur self-confidence dono bahut badh gaya hai. Yahan har bachhe ke doubts par sach me dhyan diya jata hai.',
    isVerifiedPlaceholder: false,
  },
  {
    id: 'parent-3',
    name: 'Dr. Arvind Upadhyay',
    role: 'Parent of Rohit Upadhyay',
    classTag: 'Class 9 (Foundation Batch)',
    location: 'Kaimur Road, Bhabua',
    rating: 5,
    highlightTag: 'Discipline & Daily Study Routine',
    avatarInitials: 'AU',
    quote: 'Sabse achhi baat yahan ka discipline aur systematic schedule hai. Teacher har chapter ke baad test lete hain aur student ki kamzoriyon par alag se dhyan dete hain. Rohit ab khud se daily schedule ke sath padhta hai. Class 9 se hi 10th board ke liye mazboot neev taiyar ho rahi hai.',
    isVerifiedPlaceholder: false,
  },
  {
    id: 'parent-4',
    name: 'Md. Tariq Anwar',
    role: 'Parent of Danish Anwar',
    classTag: 'Class 10 (BSEB)',
    location: 'Mohanpur, Bhabua',
    rating: 5,
    highlightTag: 'BSEB Pattern & Sanskrit Special',
    avatarInitials: 'TA',
    quote: 'Bihar Board me Sanskrit aur Science ke marks bahut matter karte hain. Genius Coaching Centre me model question papers aur previous years ke questions solve karwaye jate hain. Notes bilkul asaan aur clear bhasha me milte hain. Danish ab board exam ke liye poori tarah confident hai.',
    isVerifiedPlaceholder: false,
  },
  {
    id: 'parent-5',
    name: 'Meera Pandey',
    role: 'Parent of Shreya Pandey',
    classTag: 'Class 9 (CBSE)',
    location: 'Collectorate Colony, Bhabua',
    rating: 5,
    highlightTag: 'Working Parents Trust',
    avatarInitials: 'MP',
    quote: 'Working parent hone ki wajah se ghar par regular padhane ka samay kam mil pata tha. Genius Coaching par hum bina kisi tension ke bharosa karte hain. Regular homework check, doubt classes aur friendly vatavaran ne meri beti ki padhai me lagan badha di hai.',
    isVerifiedPlaceholder: false,
  },
  {
    id: 'parent-6',
    name: 'Rajesh Kumar Gupta',
    role: 'Parent of Aman Gupta',
    classTag: 'Class 10 (BSEB)',
    location: 'Ekta Chowk, Bhabua',
    rating: 5,
    highlightTag: 'Wajib Fees & Best Mentorship',
    avatarInitials: 'RG',
    quote: 'Bhabua me aisi coaching milna bahut badi baat hai jahan itni reasonable fees me high-quality education milti ho. Batch size controlled rehta hai jisse har bachhe ki query solve hoti hai. Humare pados ke 2 aur bachhe bhi hamare kehne par yahi padh rahe hain.',
    isVerifiedPlaceholder: false,
  },
];

export const FAQS: FAQItem[] = [
  {
    question: '1. Which classes are available?',
    answer: 'Genius Coaching Centre offers coaching exclusively for Class 9 and Class 10 students.',
    category: 'Academics',
  },
  {
    question: '2. Which subjects are taught?',
    answer: 'We teach Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Civics, Economics), plus dedicated Sanskrit (Grammar, Literature & Model Papers) for BSEB (Bihar Board) students.',
    category: 'Academics',
  },
  {
    question: '3. Which boards are covered?',
    answer: 'We cover both Bihar School Examination Board (BSEB) and Central Board of Secondary Education (CBSE) curricula.',
    category: 'Academics',
  },
  {
    question: '4. Do you conduct regular tests?',
    answer: 'Yes, we conduct regular chapter-wise tests and cumulative periodic assessments to monitor student progress and exam readiness.',
    category: 'Tests & Evaluation',
  },
  {
    question: '5. Is doubt solving available?',
    answer: 'Yes, dedicated doubt solving assistance is provided to ensure every student understands difficult concepts and problems thoroughly.',
    category: 'Student Support',
  },
  {
    question: '6. How can I enquire about admission?',
    answer: 'You can enquire by clicking the "WhatsApp Enquiry" button on this website or by calling us directly at 8102072380.',
    category: 'Admissions',
  },
  {
    question: '7. Where is Genius Coaching Centre located?',
    answer: 'Genius Coaching Centre is conveniently located in Bhabua, Kaimur District, Bihar.',
    category: 'Location',
  },
  {
    question: '8. How can I contact the coaching centre?',
    answer: 'You can reach us by phone call or WhatsApp message at 8102072380.',
    category: 'Contact',
  },
];
