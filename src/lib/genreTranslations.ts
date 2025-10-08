import { PersonalityAnalysisReport } from '@/types';

// 장르별 영어 번역 데이터
export const genreTranslations: Record<string, {
  description: string;
  characteristics: string[];
  personalityAnalysis?: {
    typeTitle: string;
    description: string;
    coreTraits?: Array<{
      traitName: string;
      description: string;
      impact: string;
    }>;
    lifestyleInsights?: string[];
    strengths?: string[];
    challenges?: string[];
    relationshipCompatibility?: string;
    musicPreferences?: string[];
    recommendedActivities?: string[];
  };
}> = {
  "jazz_cool": {
    description: "A jazz style that emerged in the late 1940s, characterized by a more relaxed and restrained approach compared to bebop.",
    characteristics: ["Calm", "Sophisticated", "Intellectual", "Restrained"],
    personalityAnalysis: {
      typeTitle: "Elegant Intellectual",
      description: "You are a refined individual who values deep thinking and restrained emotional expression. The subtle nuances and intricate harmonies of cool jazz perfectly reflect your inner depth and intellectual curiosity.",
      coreTraits: [
        {
          traitName: "Intellectual Elegance",
          description: "You handle complex concepts gracefully and prefer profound conversations",
          impact: "Exceptional insight in academic and artistic fields"
        },
        {
          traitName: "Emotional Restraint",
          description: "You excel at controlling emotions and making calm judgments in situations",
          impact: "Maintaining clear judgment even in stressful situations"
        },
        {
          traitName: "Aesthetic Sense",
          description: "You value quality and perfection through refined aesthetic sensibility",
          impact: "Pursuing high completion in creative or planning fields"
        }
      ],
      lifestyleInsights: [
        "You cherish quiet, comfortable spaces for reading and contemplation",
        "You prefer a minimalist lifestyle with fewer, high-quality items",
        "You form deep relationships and value authentic communication"
      ],
      strengths: [
        "Ability to calmly analyze and solve complex problems",
        "Talent for gaining artistic and creative inspiration through refined sensitivity",
        "Balanced sense for mediating in conflict situations"
      ],
      challenges: [
        "Decision delays due to excessive perfectionism",
        "Potential for creating distance through emotional restraint",
        "Difficulty adapting to rapid changes or sudden situations"
      ],
      relationshipCompatibility: "You prefer partners with intellectual curiosity who can engage in deep conversations, and seek mature relationships that respect each other's personal space.",
      musicPreferences: [
        "Calm background music that enhances concentration during reading or work",
        "Evening listening music to enjoy with wine",
        "Sounds for inner peace during meditation or yoga"
      ],
      recommendedActivities: [
        "Live music appreciation at jazz cafes or small venues",
        "Building cultural knowledge through museum or gallery visits",
        "Participating in book clubs or discussion groups",
        "Static rest activities like yoga, meditation, and tea time"
      ]
    }
  },
  "jazz_bebop": {
    description: "A complex and fast-paced jazz style that emerged in the 1940s, characterized by intricate improvisation and sophisticated harmonies.",
    characteristics: ["Complex", "Intellectual", "Energetic", "Sophisticated"]
  },
  "classical_symphony": {
    description: "Large-scale orchestral compositions typically consisting of multiple movements, representing the pinnacle of classical music structure.",
    characteristics: ["Grand", "Structured", "Emotional", "Complex"]
  },
  "classical_chamber": {
    description: "Intimate classical music written for small ensembles, emphasizing refined musical conversation between instruments.",
    characteristics: ["Intimate", "Refined", "Balanced", "Conversational"]
  },
  "rock_classic": {
    description: "The foundational rock music of the 1960s-70s that established the genre's core elements and lasting influence.",
    characteristics: ["Timeless", "Raw", "Powerful", "Influential"]
  },
  "rock_alternative": {
    description: "Non-mainstream rock that emerged as an alternative to commercial rock, emphasizing artistic creativity and independence.",
    characteristics: ["Independent", "Creative", "Rebellious", "Authentic"]
  },
  "electronic_ambient": {
    description: "Atmospheric electronic music designed to create immersive soundscapes and mood-enhancing environments.",
    characteristics: ["Atmospheric", "Meditative", "Spacious", "Ethereal"]
  },
  "electronic_techno": {
    description: "Repetitive, high-energy electronic dance music characterized by driving beats and synthesized sounds.",
    characteristics: ["Rhythmic", "Hypnotic", "Energetic", "Futuristic"]
  },
  "pop_mainstream": {
    description: "Commercially successful popular music designed for broad appeal and radio play.",
    characteristics: ["Catchy", "Accessible", "Polished", "Commercial"]
  },
  "pop_indie": {
    description: "Independent pop music that maintains artistic integrity while exploring creative and unconventional approaches.",
    characteristics: ["Creative", "Authentic", "Quirky", "Independent"]
  },
  "hiphop_oldschool": {
    description: "The foundational hip-hop of the 1970s-80s that established the genre's core elements of rap, DJing, and street culture.",
    characteristics: ["Foundational", "Raw", "Street", "Rhythmic"]
  },
  "hiphop_contemporary": {
    description: "Modern hip-hop that incorporates current production techniques and reflects contemporary social issues.",
    characteristics: ["Modern", "Diverse", "Technical", "Social"]
  },
  "folk_traditional": {
    description: "Music rooted in cultural traditions, passed down through generations and reflecting community heritage.",
    characteristics: ["Traditional", "Authentic", "Cultural", "Timeless"]
  },
  "folk_contemporary": {
    description: "Modern interpretations of folk music that blend traditional elements with contemporary songwriting.",
    characteristics: ["Modern", "Narrative", "Acoustic", "Personal"]
  },
  "blues_traditional": {
    description: "The foundational blues that emerged from African American communities, expressing deep emotions through simple but powerful structures.",
    characteristics: ["Emotional", "Raw", "Honest", "Foundational"]
  },
  "blues_modern": {
    description: "Contemporary blues that incorporates modern production and influences while maintaining the genre's emotional core.",
    characteristics: ["Emotional", "Contemporary", "Electric", "Soulful"]
  },
  "country_traditional": {
    description: "Classic country music that tells stories of rural life, love, and hardship through simple melodies and honest lyrics.",
    characteristics: ["Storytelling", "Rural", "Honest", "Traditional"]
  },
  "country_contemporary": {
    description: "Modern country music that blends traditional elements with pop sensibilities and contemporary production.",
    characteristics: ["Modern", "Polished", "Accessible", "Mainstream"]
  },
  "reggae_roots": {
    description: "Traditional Jamaican reggae that emphasizes spiritual themes, social consciousness, and the distinctive rhythmic pattern.",
    characteristics: ["Spiritual", "Rhythmic", "Conscious", "Traditional"]
  },
  "reggae_dancehall": {
    description: "Upbeat Jamaican music that evolved from reggae, characterized by digital rhythms and party-oriented themes.",
    characteristics: ["Upbeat", "Digital", "Danceable", "Contemporary"]
  },
  "latin_salsa": {
    description: "Energetic Latin dance music that combines Cuban rhythms with jazz influences, perfect for social dancing.",
    characteristics: ["Energetic", "Danceable", "Social", "Rhythmic"]
  },
  "latin_bossa": {
    description: "Smooth Brazilian music that blends samba rhythms with jazz harmonies, creating a sophisticated and relaxed sound.",
    characteristics: ["Smooth", "Sophisticated", "Relaxed", "Brazilian"]
  },
  "world_african": {
    description: "Traditional and contemporary music from Africa, featuring complex rhythms, call-and-response vocals, and indigenous instruments.",
    characteristics: ["Rhythmic", "Traditional", "Communal", "Diverse"]
  },
  "world_asian": {
    description: "Music from Asian cultures, incorporating traditional instruments, scales, and philosophical approaches to sound.",
    characteristics: ["Traditional", "Meditative", "Cultural", "Philosophical"]
  },
  "experimental_avant": {
    description: "Boundary-pushing music that challenges conventional structures and explores new sounds and concepts.",
    characteristics: ["Innovative", "Challenging", "Abstract", "Experimental"]
  },
  "experimental_noise": {
    description: "Extreme experimental music that incorporates unconventional sounds, feedback, and challenging sonic textures.",
    characteristics: ["Extreme", "Unconventional", "Challenging", "Abstract"]
  },
  "soundtrack_film": {
    description: "Music composed specifically for movies, designed to enhance narrative and emotional impact.",
    characteristics: ["Cinematic", "Emotional", "Narrative", "Atmospheric"]
  },
  "soundtrack_game": {
    description: "Music created for video games, often looping and designed to enhance gameplay experience.",
    characteristics: ["Interactive", "Atmospheric", "Looping", "Immersive"]
  },
  "new_age_meditation": {
    description: "Peaceful, ambient music designed to promote relaxation, meditation, and spiritual well-being.",
    characteristics: ["Peaceful", "Meditative", "Healing", "Spiritual"]
  },
  "new_age_nature": {
    description: "Music that incorporates natural sounds and gentle melodies to create connection with the natural world.",
    characteristics: ["Natural", "Gentle", "Organic", "Harmonious"]
  },
  "punk_hardcore": {
    description: "Aggressive, fast-paced punk music that emphasizes rebellion, social criticism, and raw energy.",
    characteristics: ["Aggressive", "Fast", "Rebellious", "Raw"]
  },
  "punk_pop": {
    description: "More accessible punk music that combines rebellious attitudes with catchy melodies and mainstream appeal.",
    characteristics: ["Catchy", "Rebellious", "Accessible", "Energetic"]
  },
  "metal_heavy": {
    description: "Powerful, guitar-driven music characterized by heavy distortion, strong rhythms, and intense vocals.",
    characteristics: ["Heavy", "Powerful", "Intense", "Guitar-driven"]
  },
  "metal_progressive": {
    description: "Complex metal music that incorporates unusual time signatures, extended compositions, and technical virtuosity.",
    characteristics: ["Complex", "Technical", "Progressive", "Virtuosic"]
  },
  "classical_baroque": {
    description: "European musical style from 1600-1750, characterized by elaborate and ornate features.",
    characteristics: ["Elaborate", "Ornate", "Structured", "Grand"],
    personalityAnalysis: {
      typeTitle: "Elegant Perfectionist",
      description: "You are an artistic craftsman who loves order and beauty, creating everything with precision and perfection. The complex counterpoint and ornamental beauty of baroque music perfectly reflect your refined taste, perfect pursuit of detail, and deep respect for traditional values.",
      coreTraits: [
        {
          traitName: "Meticulous Perfectionism",
          description: "You have exceptional precision and persistence to perfect every detail",
          impact: "Creating results with the highest quality and completion"
        },
        {
          traitName: "Structural Thinking",
          description: "You excel at logically organizing complex systems and approaching them systematically",
          impact: "Efficiently managing complex projects or organizations"
        },
        {
          traitName: "Classical Dignity",
          description: "You respect traditional values and formative beauty, pursuing elegant and refined expression",
          impact: "Exercising leadership based on cultural sophistication and refinement"
        }
      ],
      lifestyleInsights: [
        "You live in orderly and beautiful environments, avoiding unnecessary chaos",
        "You respect proven traditions and historical values, enjoying classical culture",
        "You form deep relationships through intellectual and dignified exchanges"
      ],
      strengths: [
        "Analytical ability to solve complex problems systematically and logically",
        "Executive power to create excellent results through high standards and perfectionism",
        "Ability to create timeless value by harmonizing tradition and innovation"
      ],
      challenges: [
        "Stress from excessive pursuit of perfection and high standards",
        "Difficulty adapting flexibly to rapid changes or unexpected situations",
        "Tendency to be overly critical of others' work or results"
      ],
      relationshipCompatibility: "You prefer partners who appreciate classical culture and tradition, seeking stable relationships based on mutual respect and understanding.",
      musicPreferences: [
        "Classical concerts and chamber music performances",
        "Music for focused work requiring concentration",
        "Traditional and historically significant musical pieces"
      ],
      recommendedActivities: [
        "Visiting classical concerts and opera performances",
        "Museum and historical site tours",
        "Learning traditional crafts or classical instruments",
        "Participating in cultural study groups"
      ]
    }
  },
  "classical_contemporary": {
    description: "Modern classical music that experiments with new forms, techniques, and expression methods.",
    characteristics: ["Experimental", "Intellectual", "Innovative", "Complex"],
    personalityAnalysis: {
      typeTitle: "Progressive Thinker",
      description: "You are a forward-thinking intellectual who constantly seeks new possibilities and challenges conventional frameworks. Contemporary classical music's experimental spirit and innovative approach perfectly reflect your progressive mindset and creative problem-solving abilities.",
      coreTraits: [
        {
          traitName: "Innovative Creativity",
          description: "You excel at finding new solutions by breaking conventional frameworks",
          impact: "Leading innovative changes in various fields"
        },
        {
          traitName: "Intellectual Curiosity",
          description: "You have a strong desire to explore and understand complex concepts and theories",
          impact: "Continuous learning and growth in academic and professional fields"
        },
        {
          traitName: "Experimental Spirit",
          description: "You're not afraid to try new approaches and learn from failure",
          impact: "Pioneering new methods and solutions"
        }
      ],
      lifestyleInsights: [
        "You enjoy learning new knowledge and skills, constantly challenging yourself",
        "You prefer avant-garde art and culture, seeking unique experiences",
        "You form relationships with like-minded people who share intellectual interests"
      ],
      strengths: [
        "Ability to propose creative solutions to complex problems",
        "Adaptability to rapidly changing environments",
        "Leadership in driving innovation and change"
      ],
      challenges: [
        "Difficulty maintaining focus due to excessive curiosity",
        "Potential for conflict due to discomfort with conventional methods",
        "Stress from perfectionist tendencies in experimental processes"
      ],
      relationshipCompatibility: "You prefer intellectually stimulating partners who can engage in deep discussions about ideas and concepts, seeking relationships that encourage mutual growth.",
      musicPreferences: [
        "Contemporary classical and experimental music",
        "Background music for creative work",
        "Avant-garde and innovative musical pieces"
      ],
      recommendedActivities: [
        "Attending contemporary music concerts and art exhibitions",
        "Participating in creative workshops and seminars",
        "Learning new instruments or composition techniques",
        "Joining intellectual discussion groups"
      ]
    }
  },
  "classical_minimalism": {
    description: "A style that pursues beauty through repetitive patterns and simple structures.",
    characteristics: ["Simple", "Repetitive", "Meditative", "Pure"],
    personalityAnalysis: {
      typeTitle: "Essential Minimalist",
      description: "You pursue true beauty and meaning through simplicity and essence. Minimalist music's repetitive patterns and gradual changes perfectly reflect your philosophy of finding depth in simplicity and your ability to concentrate deeply.",
      coreTraits: [
        {
          traitName: "Essential Focus",
          description: "You have the ability to identify and focus on what's truly important",
          impact: "Achieving high efficiency by eliminating unnecessary elements"
        },
        {
          traitName: "Deep Concentration",
          description: "You can maintain long-term focus on specific tasks or goals",
          impact: "Achieving expertise and mastery in chosen fields"
        },
        {
          traitName: "Meditative Mindset",
          description: "You find peace and insight through calm observation and contemplation",
          impact: "Maintaining emotional balance and making wise decisions"
        }
      ],
      lifestyleInsights: [
        "You prefer minimalist living with only essential items",
        "You value quality time for contemplation and inner reflection",
        "You find peace in simple, repetitive activities like walking or meditation"
      ],
      strengths: [
        "Ability to maintain focus without being distracted by external factors",
        "Talent for finding essential solutions to complex problems",
        "Capability to maintain inner peace and emotional stability"
      ],
      challenges: [
        "Potential for being perceived as rigid due to overly simple approaches",
        "Difficulty adapting when variety and change are required",
        "Risk of limiting growth opportunities due to conservative tendencies"
      ],
      relationshipCompatibility: "You prefer partners who appreciate simplicity and depth, seeking stable relationships based on genuine understanding rather than superficial excitement.",
      musicPreferences: [
        "Simple, repetitive background music for meditation",
        "Music for deep concentration during work or study",
        "Peaceful instrumental pieces for relaxation"
      ],
      recommendedActivities: [
        "Meditation and yoga practice",
        "Minimalist art and design appreciation",
        "Nature walks and quiet outdoor activities",
        "Learning traditional crafts that require patience"
      ]
    }
  },
  "classical_romantic": {
    description: "19th-century classical music that emphasized emotional expression and individual creativity.",
    characteristics: ["Emotional", "Expressive", "Passionate", "Individual"],
    personalityAnalysis: {
      typeTitle: "Passionate Romantic",
      description: "You are a deeply emotional individual who values authentic expression and personal creativity. Romantic classical music's rich emotional palette and individual expression perfectly reflect your passionate nature and artistic sensitivity.",
      coreTraits: [
        {
          traitName: "Emotional Depth",
          description: "You experience and express emotions with great intensity and authenticity",
          impact: "Creating meaningful connections and inspiring others through emotional expression"
        },
        {
          traitName: "Artistic Sensitivity",
          description: "You have refined aesthetic sense and appreciate beauty in all its forms",
          impact: "Excellence in creative and artistic endeavors"
        },
        {
          traitName: "Individual Expression",
          description: "You value personal uniqueness and authentic self-expression",
          impact: "Creating original and personally meaningful work"
        }
      ],
      lifestyleInsights: [
        "You surround yourself with beautiful objects and inspiring environments",
        "You value deep, meaningful relationships over superficial connections",
        "You need time and space for creative expression and emotional processing"
      ],
      strengths: [
        "Ability to inspire and move others through emotional expression",
        "Strong creative abilities and artistic vision",
        "Deep empathy and understanding of human nature"
      ],
      challenges: [
        "Emotional volatility that can affect decision-making",
        "Tendency toward idealism that may clash with reality",
        "Difficulty maintaining objectivity in emotional situations"
      ],
      relationshipCompatibility: "You seek deep, passionate relationships with partners who appreciate your emotional intensity and creative nature, preferring quality over quantity in connections.",
      musicPreferences: [
        "Emotionally rich classical pieces and romantic compositions",
        "Music that enhances creative and artistic activities",
        "Pieces that evoke strong emotional responses and memories"
      ],
      recommendedActivities: [
        "Attending classical concerts and opera performances",
        "Engaging in creative pursuits like painting, writing, or music",
        "Visiting art galleries and cultural events",
        "Participating in artistic communities and workshops"
      ]
    }
  },
  "electronic_chillout": {
    description: "Relaxed electronic music designed to create calm and peaceful atmospheres.",
    characteristics: ["Relaxed", "Peaceful", "Atmospheric", "Smooth"],
    personalityAnalysis: {
      typeTitle: "Peaceful Harmonizer",
      description: "You value balance and harmony in life, seeking to create peaceful environments wherever you go. Chillout music's relaxed rhythms and smooth textures perfectly reflect your calm nature and ability to find tranquility in busy modern life.",
      coreTraits: [
        {
          traitName: "Calm Presence",
          description: "You naturally create peaceful atmospheres and help others feel at ease",
          impact: "Serving as a stabilizing influence in groups and relationships"
        },
        {
          traitName: "Stress Management",
          description: "You have excellent ability to manage stress and maintain emotional balance",
          impact: "Maintaining productivity and well-being under pressure"
        },
        {
          traitName: "Harmonious Integration",
          description: "You excel at blending different elements to create cohesive wholes",
          impact: "Success in collaborative projects and team environments"
        }
      ],
      lifestyleInsights: [
        "You create relaxing home environments that serve as personal sanctuaries",
        "You prefer gradual, sustainable approaches to change and growth",
        "You value work-life balance and prioritize mental health"
      ],
      strengths: [
        "Ability to remain calm and think clearly in stressful situations",
        "Talent for creating harmonious environments and relationships",
        "Skill in helping others find peace and relaxation"
      ],
      challenges: [
        "Potential for avoiding necessary conflicts or difficult conversations",
        "Risk of being seen as lacking ambition due to preference for balance",
        "Difficulty with high-pressure, fast-paced environments"
      ],
      relationshipCompatibility: "You prefer partners who value peace and stability, seeking relationships that provide mutual support and emotional comfort.",
      musicPreferences: [
        "Background music for relaxation and unwinding",
        "Atmospheric sounds for meditation and yoga",
        "Smooth electronic music for social gatherings"
      ],
      recommendedActivities: [
        "Practicing meditation and mindfulness",
        "Creating peaceful spaces through interior design",
        "Participating in yoga and wellness activities",
        "Enjoying quiet nature experiences"
      ]
    }
  },
  "electronic_dnb": {
    description: "Fast-paced electronic music with complex drum patterns and heavy bass lines.",
    characteristics: ["Fast", "Complex", "Energetic", "Technical"],
    personalityAnalysis: {
      typeTitle: "Dynamic Achiever",
      description: "You thrive in fast-paced environments and enjoy complex challenges that require quick thinking and precise execution. Drum & bass music's intricate rhythms and high energy perfectly reflect your dynamic approach to life and ability to handle multiple tasks simultaneously.",
      coreTraits: [
        {
          traitName: "High-Speed Processing",
          description: "You excel at quickly analyzing information and making rapid decisions",
          impact: "Outstanding performance in fast-paced, demanding environments"
        },
        {
          traitName: "Complex Coordination",
          description: "You can manage multiple complex tasks and patterns simultaneously",
          impact: "Success in multifaceted projects and leadership roles"
        },
        {
          traitName: "Energetic Drive",
          description: "You maintain high energy levels and motivate others through your enthusiasm",
          impact: "Leading dynamic teams and inspiring action"
        }
      ],
      lifestyleInsights: [
        "You prefer active, stimulating environments with constant challenges",
        "You enjoy technology and are quick to adopt new tools and methods",
        "You thrive in social situations with high energy and interaction"
      ],
      strengths: [
        "Exceptional ability to work efficiently under pressure",
        "Talent for coordinating complex projects with multiple moving parts",
        "Natural leadership in dynamic, change-oriented situations"
      ],
      challenges: [
        "Risk of burnout from constantly operating at high intensity",
        "Difficulty with slow-paced or overly structured environments",
        "Potential impatience with others who work at different speeds"
      ],
      relationshipCompatibility: "You prefer partners who can match your energy and enthusiasm, seeking relationships that provide excitement and mutual growth.",
      musicPreferences: [
        "High-energy music for workouts and active pursuits",
        "Complex electronic music for focused work sessions",
        "Energizing tracks for social events and parties"
      ],
      recommendedActivities: [
        "High-intensity sports and fitness activities",
        "Learning new technologies and digital skills",
        "Participating in fast-paced competitive activities",
        "Attending electronic music events and festivals"
      ]
    }
  },
  "electronic_dubstep": {
    description: "Electronic music characterized by heavy bass drops and aggressive synthesized sounds.",
    characteristics: ["Heavy", "Aggressive", "Intense", "Powerful"],
    personalityAnalysis: {
      typeTitle: "Intense Transformer",
      description: "You have powerful inner strength and the ability to create dramatic positive changes in challenging situations. Dubstep's heavy bass drops and intense energy perfectly reflect your transformative power and ability to overcome obstacles.",
      coreTraits: [
        {
          traitName: "Transformative Power",
          description: "You excel at creating significant positive changes in difficult situations",
          impact: "Leading breakthrough innovations and organizational transformations"
        },
        {
          traitName: "Intense Focus",
          description: "You can concentrate with exceptional intensity when pursuing important goals",
          impact: "Achieving remarkable results in chosen areas of focus"
        },
        {
          traitName: "Resilient Strength",
          description: "You bounce back from setbacks stronger and use challenges as growth opportunities",
          impact: "Inspiring others through your ability to overcome adversity"
        }
      ],
      lifestyleInsights: [
        "You're drawn to challenging situations that allow you to demonstrate your capabilities",
        "You prefer authentic, genuine experiences over superficial social interactions",
        "You need outlets for your intense energy through physical or creative activities"
      ],
      strengths: [
        "Exceptional ability to overcome obstacles and achieve difficult goals",
        "Natural talent for motivating others during challenging times",
        "Strong determination and persistence in pursuing objectives"
      ],
      challenges: [
        "Risk of overwhelming others with your intensity",
        "Potential for conflict due to direct, uncompromising approach",
        "Difficulty relaxing and enjoying quiet, peaceful moments"
      ],
      relationshipCompatibility: "You prefer partners who appreciate your strength and intensity, seeking relationships that can handle emotional depth and mutual challenge.",
      musicPreferences: [
        "High-intensity music for workouts and physical activities",
        "Powerful tracks for motivation during challenging tasks",
        "Energizing music for overcoming difficult situations"
      ],
      recommendedActivities: [
        "Intense physical training and competitive sports",
        "Taking on challenging projects that require determination",
        "Participating in adventure sports and extreme activities",
        "Engaging in transformative personal development work"
      ]
    }
  },
  "electronic_house": {
    description: "Electronic dance music with steady four-on-the-floor beats, designed for dancing and social connection.",
    characteristics: ["Rhythmic", "Social", "Uplifting", "Energetic"],
    personalityAnalysis: {
      typeTitle: "Social Energizer",
      description: "You are a natural social connector who brings people together and creates positive, energetic atmospheres. House music's steady rhythms and uplifting nature perfectly reflect your ability to unite people and create shared experiences of joy and connection.",
      coreTraits: [
        {
          traitName: "Social Magnetism",
          description: "You naturally attract people and create inclusive, welcoming environments",
          impact: "Building strong communities and social networks"
        },
        {
          traitName: "Positive Energy",
          description: "You consistently maintain and share positive energy that uplifts others",
          impact: "Motivating teams and creating enthusiastic work environments"
        },
        {
          traitName: "Rhythmic Consistency",
          description: "You provide stable, reliable support while maintaining dynamic energy",
          impact: "Success in leadership roles that require both stability and motivation"
        }
      ],
      lifestyleInsights: [
        "You thrive in social settings and enjoy bringing people together",
        "You prefer collaborative work environments over solitary activities",
        "You find energy through social interaction and shared experiences"
      ],
      strengths: [
        "Exceptional ability to build and maintain social connections",
        "Natural talent for creating positive, motivating environments",
        "Strong leadership skills in team-oriented situations"
      ],
      challenges: [
        "Difficulty with solitary work or extended periods alone",
        "Risk of overcommitting to social obligations",
        "Potential energy depletion from constantly giving to others"
      ],
      relationshipCompatibility: "You prefer partners who enjoy social activities and can participate in your vibrant social life, seeking relationships that enhance your social connections.",
      musicPreferences: [
        "Upbeat dance music for social gatherings and parties",
        "Energizing tracks for group workouts and activities",
        "Background music that creates positive social atmospheres"
      ],
      recommendedActivities: [
        "Organizing social events and community gatherings",
        "Participating in group fitness and dance classes",
        "Attending music festivals and social clubs",
        "Volunteering for community organizations"
      ]
    }
  },
  "hiphop_trap": {
    description: "Modern hip-hop subgenre characterized by heavy bass, rapid hi-hats, and contemporary urban themes.",
    characteristics: ["Modern", "Heavy", "Urban", "Intense"],
    personalityAnalysis: {
      typeTitle: "Urban Innovator",
      description: "You are a modern, street-smart individual who understands contemporary culture and isn't afraid to push boundaries. Trap music's heavy beats and urban authenticity perfectly reflect your ability to navigate modern challenges with confidence and create your own path to success.",
      coreTraits: [
        {
          traitName: "Street Intelligence",
          description: "You have practical wisdom and the ability to understand complex social dynamics",
          impact: "Success in competitive environments through strategic thinking"
        },
        {
          traitName: "Cultural Awareness",
          description: "You stay current with trends and understand contemporary social movements",
          impact: "Leadership in modern, diverse environments"
        },
        {
          traitName: "Resilient Ambition",
          description: "You pursue your goals with determination despite obstacles and setbacks",
          impact: "Achieving success through persistence and adaptability"
        }
      ],
      lifestyleInsights: [
        "You stay connected to current trends and cultural movements",
        "You value authenticity and respect those who stay true to themselves",
        "You prefer direct communication and appreciate honest feedback"
      ],
      strengths: [
        "Strong ability to adapt and thrive in changing environments",
        "Natural understanding of contemporary social and cultural dynamics",
        "Resilience and determination in pursuing ambitious goals"
      ],
      challenges: [
        "Potential for conflict due to direct, uncompromising approach",
        "Risk of dismissing traditional methods too quickly",
        "Difficulty with overly formal or structured environments"
      ],
      relationshipCompatibility: "You prefer partners who understand your ambition and cultural awareness, seeking relationships built on mutual respect and shared goals.",
      musicPreferences: [
        "Current hip-hop and urban music that reflects contemporary themes",
        "High-energy tracks for motivation and workouts",
        "Music that connects to social and cultural movements"
      ],
      recommendedActivities: [
        "Staying engaged with current social and cultural trends",
        "Participating in competitive sports or business challenges",
        "Attending urban cultural events and festivals",
        "Engaging in community activism and social causes"
      ]
    }
  },
  "jazz_fusion": {
    description: "A blend of jazz improvisation with rock, funk, and electronic elements, creating a sophisticated hybrid style.",
    characteristics: ["Sophisticated", "Fusion", "Technical", "Innovative"],
    personalityAnalysis: {
      typeTitle: "Versatile Synthesizer",
      description: "You excel at combining different elements to create something entirely new and innovative. Jazz fusion's blend of multiple genres perfectly reflects your ability to integrate diverse perspectives and create sophisticated solutions that transcend traditional boundaries.",
      coreTraits: [
        {
          traitName: "Integrative Thinking",
          description: "You excel at combining diverse elements to create innovative solutions",
          impact: "Leadership in interdisciplinary projects and cross-functional teams"
        },
        {
          traitName: "Technical Sophistication",
          description: "You appreciate and master complex technical skills across multiple domains",
          impact: "Expertise in specialized fields requiring advanced knowledge"
        },
        {
          traitName: "Adaptive Innovation",
          description: "You continuously evolve your approach by incorporating new influences and ideas",
          impact: "Staying ahead of trends and driving innovation in your field"
        }
      ],
      lifestyleInsights: [
        "You enjoy learning from diverse sources and integrating different perspectives",
        "You prefer environments that encourage experimentation and creative freedom",
        "You value both technical excellence and artistic expression"
      ],
      strengths: [
        "Exceptional ability to synthesize complex information from multiple sources",
        "Natural talent for finding innovative solutions to multifaceted problems",
        "Strong adaptability to changing circumstances and requirements"
      ],
      challenges: [
        "Risk of overcomplicating simple situations",
        "Difficulty making decisions when too many options are available",
        "Potential frustration with overly rigid or traditional approaches"
      ],
      relationshipCompatibility: "You prefer partners who appreciate complexity and can engage with your multifaceted interests, seeking relationships that allow for mutual growth and exploration.",
      musicPreferences: [
        "Complex, layered music that rewards deep listening",
        "Genres that blend different musical traditions and styles",
        "Technical pieces that showcase musical sophistication"
      ],
      recommendedActivities: [
        "Learning multiple instruments or advanced musical techniques",
        "Participating in interdisciplinary projects and collaborations",
        "Attending diverse cultural events and festivals",
        "Engaging in complex problem-solving activities"
      ]
    }
  },
  "jazz_smooth": {
    description: "Accessible jazz style that emphasizes melody and relaxation over complex improvisation.",
    characteristics: ["Smooth", "Melodic", "Accessible", "Relaxing"],
    personalityAnalysis: {
      typeTitle: "Sophisticated Diplomat",
      description: "You have the ability to make complex things accessible and bring people together through your natural charm and diplomatic skills. Smooth jazz's melodic accessibility perfectly reflects your talent for creating comfortable environments while maintaining sophistication.",
      coreTraits: [
        {
          traitName: "Diplomatic Grace",
          description: "You excel at navigating complex social situations with elegance and tact",
          impact: "Success in roles requiring negotiation and relationship management"
        },
        {
          traitName: "Accessible Sophistication",
          description: "You combine refined taste with the ability to connect with diverse audiences",
          impact: "Bridge-building between different groups and perspectives"
        },
        {
          traitName: "Calming Influence",
          description: "You have a natural ability to create relaxed, comfortable atmospheres",
          impact: "Creating productive, harmonious work and social environments"
        }
      ],
      lifestyleInsights: [
        "You enjoy creating comfortable, stylish environments for yourself and others",
        "You prefer quality experiences that balance sophistication with accessibility",
        "You value relationships that provide both intellectual stimulation and emotional comfort"
      ],
      strengths: [
        "Exceptional ability to mediate conflicts and find common ground",
        "Natural talent for making others feel comfortable and welcome",
        "Strong social skills that work across diverse groups and contexts"
      ],
      challenges: [
        "Risk of avoiding necessary confrontations to maintain harmony",
        "Potential difficulty asserting strong personal opinions",
        "Tendency to prioritize others' comfort over your own needs"
      ],
      relationshipCompatibility: "You prefer partners who appreciate your diplomatic nature and social grace, seeking relationships that provide both emotional warmth and intellectual companionship.",
      musicPreferences: [
        "Smooth, melodic music for relaxation and social settings",
        "Background music that enhances conversations and gatherings",
        "Sophisticated but accessible pieces for various occasions"
      ],
      recommendedActivities: [
        "Hosting social gatherings and dinner parties",
        "Participating in cultural events and art appreciation",
        "Engaging in community diplomacy and conflict resolution",
        "Enjoying fine dining and cultural experiences"
      ]
    }
  },
  "pop_dream": {
    description: "Ethereal pop music characterized by atmospheric sounds, reverb-heavy vocals, and dreamy textures.",
    characteristics: ["Ethereal", "Atmospheric", "Dreamy", "Introspective"],
    personalityAnalysis: {
      typeTitle: "Imaginative Dreamer",
      description: "You possess a rich inner world and the ability to see beauty and possibility in everyday life. Dream pop's ethereal soundscapes perfectly reflect your imaginative nature and your talent for creating inspiring visions of what could be.",
      coreTraits: [
        {
          traitName: "Vivid Imagination",
          description: "You have a rich creative mind that generates innovative ideas and solutions",
          impact: "Excellence in creative fields and visionary thinking"
        },
        {
          traitName: "Intuitive Sensitivity",
          description: "You perceive subtle emotional and aesthetic nuances that others might miss",
          impact: "Deep understanding of human nature and artistic expression"
        },
        {
          traitName: "Inspirational Vision",
          description: "You can envision beautiful possibilities and inspire others to pursue them",
          impact: "Leadership in creative and transformational initiatives"
        }
      ],
      lifestyleInsights: [
        "You create beautiful, inspiring environments that reflect your inner vision",
        "You need time for contemplation and creative expression",
        "You're drawn to art, nature, and experiences that feed your imagination"
      ],
      strengths: [
        "Exceptional creative abilities and artistic vision",
        "Natural talent for inspiring others through beautiful ideas",
        "Strong intuitive understanding of emotions and aesthetics"
      ],
      challenges: [
        "Difficulty with harsh realities or overly practical demands",
        "Risk of becoming lost in dreams without taking concrete action",
        "Sensitivity to criticism or negative environments"
      ],
      relationshipCompatibility: "You prefer partners who appreciate your creative nature and can share in your imaginative world, seeking relationships that provide emotional depth and mutual inspiration.",
      musicPreferences: [
        "Atmospheric music that enhances creative work and contemplation",
        "Ethereal sounds for relaxation and meditation",
        "Dreamy background music for artistic activities"
      ],
      recommendedActivities: [
        "Engaging in creative arts like painting, writing, or music",
        "Spending time in beautiful natural settings",
        "Participating in artistic communities and workshops",
        "Exploring meditation and mindfulness practices"
      ]
    }
  },
  "pop_folk": {
    description: "Contemporary pop music that incorporates folk traditions and acoustic elements.",
    characteristics: ["Authentic", "Acoustic", "Storytelling", "Heartfelt"],
    personalityAnalysis: {
      typeTitle: "Authentic Storyteller",
      description: "You value genuine connections and have a gift for sharing meaningful stories that resonate with others. Pop folk's combination of contemporary appeal and traditional authenticity perfectly reflects your ability to bridge past and present while staying true to your values.",
      coreTraits: [
        {
          traitName: "Authentic Expression",
          description: "You communicate with genuine honesty and stay true to your core values",
          impact: "Building trust and deep connections through authentic leadership"
        },
        {
          traitName: "Narrative Wisdom",
          description: "You understand the power of stories to teach, heal, and connect people",
          impact: "Excellence in communication, teaching, and relationship building"
        },
        {
          traitName: "Cultural Bridge-Building",
          description: "You connect traditional wisdom with contemporary needs and perspectives",
          impact: "Success in roles that require cultural sensitivity and adaptation"
        }
      ],
      lifestyleInsights: [
        "You value meaningful traditions while embracing positive change",
        "You prefer authentic experiences over superficial entertainment",
        "You find fulfillment in sharing stories and connecting with others"
      ],
      strengths: [
        "Natural ability to connect with people from diverse backgrounds",
        "Strong communication skills that inspire trust and understanding",
        "Talent for preserving valuable traditions while adapting to modern needs"
      ],
      challenges: [
        "Difficulty in environments that prioritize style over substance",
        "Risk of being seen as old-fashioned in rapidly changing contexts",
        "Potential conflict when authenticity clashes with practicality"
      ],
      relationshipCompatibility: "You prefer partners who value authenticity and emotional depth, seeking relationships built on genuine understanding and shared values.",
      musicPreferences: [
        "Acoustic music that tells meaningful stories",
        "Folk-influenced pieces that connect to cultural traditions",
        "Heartfelt songs that express genuine emotions"
      ],
      recommendedActivities: [
        "Participating in storytelling events and community gatherings",
        "Learning traditional crafts and cultural practices",
        "Engaging in volunteer work and community service",
        "Attending intimate acoustic music performances"
      ]
    }
  },
  "pop_kpop": {
    description: "Korean pop music characterized by polished production, choreography, and global appeal.",
    characteristics: ["Polished", "Global", "Energetic", "Trendy"],
    personalityAnalysis: {
      typeTitle: "Global Trendsetter",
      description: "You have your finger on the pulse of global trends and excel at creating polished, appealing presentations of yourself and your ideas. K-pop's international success and meticulous attention to detail perfectly reflect your ability to understand and influence contemporary culture.",
      coreTraits: [
        {
          traitName: "Global Awareness",
          description: "You understand and adapt to diverse cultural contexts and international trends",
          impact: "Success in multicultural environments and global markets"
        },
        {
          traitName: "Polished Excellence",
          description: "You pay attention to details and present yourself and your work with high quality",
          impact: "Professional success through consistently excellent presentations"
        },
        {
          traitName: "Cultural Innovation",
          description: "You blend different cultural elements to create something fresh and appealing",
          impact: "Leadership in creative industries and cross-cultural initiatives"
        }
      ],
      lifestyleInsights: [
        "You stay current with global trends and cultural movements",
        "You invest in your appearance and presentation, understanding their importance",
        "You enjoy connecting with diverse groups of people across cultures"
      ],
      strengths: [
        "Exceptional ability to understand and influence contemporary trends",
        "Strong presentation skills and attention to quality details",
        "Natural talent for cross-cultural communication and adaptation"
      ],
      challenges: [
        "Risk of focusing too much on external presentation over internal substance",
        "Pressure to constantly stay current with rapidly changing trends",
        "Potential difficulty with situations that require less polished approaches"
      ],
      relationshipCompatibility: "You prefer partners who appreciate your global perspective and attention to quality, seeking relationships that can adapt to diverse social and cultural contexts.",
      musicPreferences: [
        "Current pop music from various international markets",
        "High-quality, well-produced tracks with broad appeal",
        "Music that connects to global cultural movements"
      ],
      recommendedActivities: [
        "Staying engaged with international cultural trends",
        "Participating in multicultural events and communities",
        "Learning about different cultures and languages",
        "Attending polished entertainment and cultural events"
      ]
    }
  },
  "pop_synthpop": {
    description: "Electronic pop music that emerged in the 1980s, characterized by synthesizers and futuristic sounds.",
    characteristics: ["Retro-futuristic", "Electronic", "Nostalgic", "Innovative"],
    personalityAnalysis: {
      typeTitle: "Retro-Future Visionary",
      description: "You have a unique ability to appreciate both past innovations and future possibilities, creating bridges between nostalgia and progress. Synthpop's blend of retro aesthetics and futuristic sounds perfectly reflects your talent for combining classic elements with innovative approaches.",
      coreTraits: [
        {
          traitName: "Temporal Integration",
          description: "You excel at combining lessons from the past with visions for the future",
          impact: "Creating sustainable innovations that honor tradition while embracing progress"
        },
        {
          traitName: "Aesthetic Innovation",
          description: "You have a strong sense of style that blends classic and contemporary elements",
          impact: "Success in design, fashion, and creative fields"
        },
        {
          traitName: "Technological Appreciation",
          description: "You understand and appreciate the role of technology in creative expression",
          impact: "Leadership in tech-creative hybrid fields and digital innovation"
        }
      ],
      lifestyleInsights: [
        "You appreciate vintage aesthetics while embracing modern technology",
        "You enjoy reimagining classic concepts with contemporary tools and perspectives",
        "You're drawn to experiences that blend nostalgia with innovation"
      ],
      strengths: [
        "Unique ability to create fresh approaches by combining old and new",
        "Strong aesthetic sense that appeals to diverse audiences",
        "Natural understanding of cyclical trends and cultural patterns"
      ],
      challenges: [
        "Risk of being caught between past and future without strong present focus",
        "Potential difficulty choosing between nostalgic and progressive approaches",
        "Challenge of maintaining relevance as both retro and futuristic trends evolve"
      ],
      relationshipCompatibility: "You prefer partners who appreciate your unique blend of nostalgia and innovation, seeking relationships that can navigate both tradition and change.",
      musicPreferences: [
        "Electronic music that combines retro and contemporary elements",
        "Soundtrack music that evokes both past and future",
        "Innovative pieces that reimagine classic styles"
      ],
      recommendedActivities: [
        "Exploring vintage technology and modern innovations",
        "Participating in retro-futuristic cultural events",
        "Creating projects that blend classic and contemporary elements",
        "Learning about the history and future of technology and design"
      ]
    }
  },
  "rnb_classic": {
    description: "Traditional rhythm and blues with soulful vocals, strong rhythms, and emotional depth.",
    characteristics: ["Soulful", "Emotional", "Traditional", "Rhythmic"],
    personalityAnalysis: {
      typeTitle: "Soulful Traditionalist",
      description: "You possess deep emotional wisdom and a strong connection to traditional values and authentic expression. Classic R&B's soulful vocals and emotional depth perfectly reflect your ability to touch people's hearts and your commitment to genuine, meaningful connections.",
      coreTraits: [
        {
          traitName: "Emotional Authenticity",
          description: "You express emotions genuinely and help others connect with their true feelings",
          impact: "Creating healing and transformative experiences for others"
        },
        {
          traitName: "Traditional Wisdom",
          description: "You understand and preserve valuable cultural traditions and life lessons",
          impact: "Providing guidance and stability in changing times"
        },
        {
          traitName: "Rhythmic Connection",
          description: "You have natural timing and can synchronize with others' emotional and social rhythms",
          impact: "Excellence in collaborative work and relationship building"
        }
      ],
      lifestyleInsights: [
        "You value deep, meaningful relationships over superficial connections",
        "You find wisdom in traditional practices and time-tested approaches",
        "You're drawn to experiences that allow for genuine emotional expression"
      ],
      strengths: [
        "Exceptional ability to understand and work with human emotions",
        "Natural talent for preserving and sharing cultural wisdom",
        "Strong intuitive understanding of timing and relationship dynamics"
      ],
      challenges: [
        "Difficulty adapting to rapidly changing social or technological environments",
        "Risk of being overwhelmed by others' emotional needs",
        "Potential resistance to new approaches that seem to disregard tradition"
      ],
      relationshipCompatibility: "You prefer partners who value emotional depth and authenticity, seeking relationships that provide genuine intimacy and mutual emotional support.",
      musicPreferences: [
        "Classic soul and R&B that expresses deep emotions",
        "Traditional music that connects to cultural heritage",
        "Songs that tell meaningful stories about human experience"
      ],
      recommendedActivities: [
        "Participating in traditional cultural events and celebrations",
        "Engaging in mentoring and teaching roles",
        "Attending live music venues that feature authentic performances",
        "Volunteering for causes that support community well-being"
      ]
    }
  },
  "rnb_neosoul": {
    description: "Contemporary R&B that blends traditional soul with modern elements and conscious themes.",
    characteristics: ["Contemporary", "Conscious", "Sophisticated", "Innovative"],
    personalityAnalysis: {
      typeTitle: "Conscious Innovator",
      description: "You combine respect for traditional wisdom with contemporary awareness and social consciousness. Neo-soul's blend of classic soul with modern elements perfectly reflects your ability to honor the past while addressing current challenges with innovative solutions.",
      coreTraits: [
        {
          traitName: "Social Consciousness",
          description: "You're aware of social issues and committed to making positive changes",
          impact: "Leadership in social justice and community improvement initiatives"
        },
        {
          traitName: "Cultural Evolution",
          description: "You help traditions evolve while maintaining their essential spirit",
          impact: "Bridge-building between different generations and cultural perspectives"
        },
        {
          traitName: "Sophisticated Expression",
          description: "You communicate complex ideas with emotional intelligence and artistic flair",
          impact: "Success in roles requiring both intellectual depth and emotional connection"
        }
      ],
      lifestyleInsights: [
        "You stay informed about social issues and seek ways to contribute positively",
        "You appreciate both traditional culture and contemporary innovations",
        "You prefer authentic, meaningful experiences over superficial entertainment"
      ],
      strengths: [
        "Strong ability to connect traditional wisdom with contemporary needs",
        "Natural talent for inspiring others through conscious, purposeful action",
        "Excellent balance of intellectual understanding and emotional intelligence"
      ],
      challenges: [
        "Risk of becoming overwhelmed by the weight of social responsibility",
        "Potential frustration with others who don't share your level of consciousness",
        "Difficulty finding balance between idealism and practical action"
      ],
      relationshipCompatibility: "You prefer partners who share your social consciousness and appreciation for both tradition and progress, seeking relationships that support mutual growth and positive impact.",
      musicPreferences: [
        "Contemporary R&B and neo-soul with meaningful lyrics",
        "Music that addresses social themes and personal growth",
        "Sophisticated pieces that blend traditional and modern elements"
      ],
      recommendedActivities: [
        "Participating in social justice and community activism",
        "Attending conscious music events and cultural discussions",
        "Engaging in personal development and spiritual growth practices",
        "Supporting artists and organizations with positive social impact"
      ]
    }
  },
  "rock_indie": {
    description: "Independent rock music that prioritizes artistic integrity over commercial appeal.",
    characteristics: ["Independent", "Authentic", "Creative", "Non-conformist"],
    personalityAnalysis: {
      typeTitle: "Independent Creative",
      description: "You value artistic integrity and authenticity over popular acceptance, creating your own path based on personal vision rather than external expectations. Indie rock's independent spirit perfectly reflects your commitment to staying true to your creative vision.",
      coreTraits: [
        {
          traitName: "Artistic Integrity",
          description: "You prioritize authentic self-expression over commercial success or popular approval",
          impact: "Creating original, meaningful work that stands the test of time"
        },
        {
          traitName: "Independent Thinking",
          description: "You form your own opinions and aren't easily influenced by peer pressure or trends",
          impact: "Leadership through original ideas and unconventional solutions"
        },
        {
          traitName: "Creative Innovation",
          description: "You constantly explore new forms of expression and aren't afraid to experiment",
          impact: "Pioneering new approaches in creative and professional fields"
        }
      ],
      lifestyleInsights: [
        "You prefer authentic experiences over mainstream entertainment",
        "You value quality and originality over popularity and trends",
        "You're drawn to communities of like-minded independent thinkers"
      ],
      strengths: [
        "Strong ability to maintain authenticity in face of external pressure",
        "Natural talent for original thinking and creative problem-solving",
        "Courage to pursue unconventional paths and take creative risks"
      ],
      challenges: [
        "Potential difficulty with compromise or collaborative decision-making",
        "Risk of isolation due to rejection of mainstream approaches",
        "Challenge of balancing artistic integrity with practical necessities"
      ],
      relationshipCompatibility: "You prefer partners who respect your independence and creativity, seeking relationships that allow for individual expression within mutual support.",
      musicPreferences: [
        "Independent and alternative music that prioritizes artistry",
        "Underground and emerging artists who create original work",
        "Music that challenges conventional structures and expectations"
      ],
      recommendedActivities: [
        "Supporting independent artists and small creative businesses",
        "Participating in alternative cultural events and art scenes",
        "Creating original artistic or creative projects",
        "Exploring unconventional learning and growth opportunities"
      ]
    }
  },
  "rock_metal": {
    description: "Heavy, powerful rock music characterized by aggressive guitar work and intense energy.",
    characteristics: ["Heavy", "Powerful", "Intense", "Aggressive"],
    personalityAnalysis: {
      typeTitle: "Powerful Warrior",
      description: "You possess inner strength and the courage to face life's challenges head-on, never backing down from what you believe in. Metal's heavy, intense sound perfectly reflects your powerful spirit and your ability to channel strong emotions into positive action.",
      coreTraits: [
        {
          traitName: "Inner Strength",
          description: "You have remarkable resilience and the ability to overcome significant obstacles",
          impact: "Success in challenging situations that require determination and courage"
        },
        {
          traitName: "Emotional Intensity",
          description: "You experience and express emotions with great depth and authenticity",
          impact: "Creating powerful connections and inspiring others through passionate expression"
        },
        {
          traitName: "Unwavering Determination",
          description: "You pursue your goals with fierce commitment and don't give up easily",
          impact: "Achieving ambitious objectives through persistent effort"
        }
      ],
      lifestyleInsights: [
        "You prefer direct, honest communication over subtle or indirect approaches",
        "You're drawn to challenging activities that test your limits and build strength",
        "You value loyalty and authenticity in relationships and communities"
      ],
      strengths: [
        "Exceptional ability to persist through difficult circumstances",
        "Natural leadership in high-pressure or crisis situations",
        "Strong capacity for channeling intense emotions into productive action"
      ],
      challenges: [
        "Risk of overwhelming others with your intensity",
        "Potential difficulty with subtle or diplomatic approaches",
        "Challenge of finding appropriate outlets for your powerful energy"
      ],
      relationshipCompatibility: "You prefer partners who can appreciate your intensity and strength, seeking relationships that can handle emotional depth and mutual challenge.",
      musicPreferences: [
        "Heavy, powerful music that matches your emotional intensity",
        "Music for high-energy workouts and stress relief",
        "Songs that express strong emotions and personal struggles"
      ],
      recommendedActivities: [
        "Intense physical training and competitive sports",
        "Taking on challenging projects that require determination",
        "Participating in activities that build physical and mental strength",
        "Engaging with communities that appreciate intensity and authenticity"
      ]
    }
  },
  "rock_progressive": {
    description: "Complex rock music featuring unusual time signatures, extended compositions, and technical virtuosity.",
    characteristics: ["Complex", "Technical", "Intellectual", "Ambitious"],
    personalityAnalysis: {
      typeTitle: "Visionary Architect",
      description: "You think in complex, long-term patterns and aren't satisfied with simple solutions to complicated problems. Progressive rock's intricate compositions perfectly reflect your ability to create sophisticated, multi-layered approaches to challenges.",
      coreTraits: [
        {
          traitName: "Systematic Complexity",
          description: "You excel at understanding and managing complex, interconnected systems",
          impact: "Success in roles requiring strategic thinking and long-term planning"
        },
        {
          traitName: "Technical Mastery",
          description: "You pursue excellence through deep understanding and skilled execution",
          impact: "Expertise in specialized fields requiring advanced knowledge and precision"
        },
        {
          traitName: "Visionary Thinking",
          description: "You can envision complex future scenarios and work toward ambitious long-term goals",
          impact: "Leadership in transformational projects and strategic initiatives"
        }
      ],
      lifestyleInsights: [
        "You prefer depth over breadth and enjoy mastering complex subjects",
        "You're drawn to ambitious projects that challenge conventional limitations",
        "You value intellectual stimulation and continuous learning"
      ],
      strengths: [
        "Exceptional ability to plan and execute complex, long-term projects",
        "Natural talent for seeing patterns and connections others might miss",
        "Strong commitment to excellence and continuous improvement"
      ],
      challenges: [
        "Risk of overcomplicating situations that could benefit from simpler approaches",
        "Potential impatience with others who prefer less complex methods",
        "Difficulty with time constraints that don't allow for thorough development"
      ],
      relationshipCompatibility: "You prefer partners who can appreciate complexity and engage with your ambitious visions, seeking relationships that provide intellectual stimulation and mutual growth.",
      musicPreferences: [
        "Complex, layered music that rewards careful listening",
        "Technical pieces that showcase musical sophistication and skill",
        "Long-form compositions that develop themes over extended periods"
      ],
      recommendedActivities: [
        "Learning complex skills that require long-term development",
        "Participating in ambitious, multi-phase projects",
        "Engaging with technical or intellectual communities",
        "Exploring subjects that combine multiple disciplines"
      ]
    }
  },
  "rock_punk": {
    description: "Raw, energetic rock music that emerged as a reaction against mainstream culture and musical complexity.",
    characteristics: ["Raw", "Rebellious", "Energetic", "Direct"],
    personalityAnalysis: {
      typeTitle: "Authentic Rebel",
      description: "You value authenticity and directness, and you're not afraid to challenge systems or conventions that don't serve genuine human needs. Punk rock's raw energy and rebellious spirit perfectly reflect your commitment to staying true to yourself and speaking out against injustice.",
      coreTraits: [
        {
          traitName: "Authentic Expression",
          description: "You communicate with raw honesty and refuse to compromise your core values",
          impact: "Inspiring others to embrace authenticity and reject superficiality"
        },
        {
          traitName: "Rebellious Justice",
          description: "You challenge unfair systems and fight for what you believe is right",
          impact: "Creating positive change by questioning and improving established systems"
        },
        {
          traitName: "Energetic Action",
          description: "You channel your passion into direct, immediate action rather than prolonged deliberation",
          impact: "Getting things done quickly and motivating others to take action"
        }
      ],
      lifestyleInsights: [
        "You prefer authentic, unpolished experiences over manufactured entertainment",
        "You're motivated by causes you believe in and aren't afraid to stand up for them",
        "You value community with others who share your commitment to authenticity"
      ],
      strengths: [
        "Strong ability to cut through complexity and identify core issues",
        "Natural courage to speak truth even when it's uncomfortable",
        "Talent for motivating others to take action on important issues"
      ],
      challenges: [
        "Risk of alienating others through overly direct or confrontational approach",
        "Potential difficulty with situations requiring diplomacy or compromise",
        "Challenge of maintaining energy and motivation for long-term projects"
      ],
      relationshipCompatibility: "You prefer partners who share your values and authenticity, seeking relationships based on genuine connection rather than social convenience.",
      musicPreferences: [
        "Raw, unpolished music that expresses genuine emotion",
        "Songs with direct messages about social or personal issues",
        "High-energy music that channels passion and rebellion"
      ],
      recommendedActivities: [
        "Participating in social causes and activist movements",
        "Supporting independent and alternative cultural expressions",
        "Engaging in direct community action and volunteer work",
        "Attending authentic, grassroots cultural events"
      ]
    }
  },
  "world_latin": {
    description: "Music from Latin American cultures, featuring rich rhythms, passionate expression, and cultural heritage.",
    characteristics: ["Rhythmic", "Passionate", "Cultural", "Vibrant"],
    personalityAnalysis: {
      typeTitle: "Passionate Connector",
      description: "You bring warmth, rhythm, and passion to everything you do, creating connections that transcend cultural and social boundaries. Latin music's vibrant rhythms and emotional expression perfectly reflect your ability to bring people together through shared joy and cultural appreciation.",
      coreTraits: [
        {
          traitName: "Passionate Expression",
          description: "You express emotions openly and authentically, inspiring others through your warmth",
          impact: "Creating enthusiastic, positive environments that motivate and energize others"
        },
        {
          traitName: "Cultural Bridge-Building",
          description: "You appreciate and connect different cultural traditions and perspectives",
          impact: "Success in multicultural environments and international collaboration"
        },
        {
          traitName: "Rhythmic Harmony",
          description: "You have natural timing and can synchronize with others' energy and emotions",
          impact: "Excellence in collaborative work and creating group cohesion"
        }
      ],
      lifestyleInsights: [
        "You enjoy vibrant social situations and cultural celebrations",
        "You value family and community connections highly",
        "You express yourself through movement, music, and colorful self-expression"
      ],
      strengths: [
        "Exceptional ability to create warm, welcoming environments",
        "Natural talent for bringing people together across cultural differences",
        "Strong emotional intelligence and ability to read social dynamics"
      ],
      challenges: [
        "Potential difficulty in very formal or emotionally restrained environments",
        "Risk of being overwhelmed by others' emotions or social needs",
        "Challenge with situations that require extended solitude or emotional distance"
      ],
      relationshipCompatibility: "You prefer partners who appreciate your warmth and passion, seeking relationships that provide emotional connection and shared cultural experiences.",
      musicPreferences: [
        "Rhythmic Latin music that inspires movement and celebration",
        "Passionate songs that express deep emotions and cultural pride",
        "Music that brings people together for dancing and social connection"
      ],
      recommendedActivities: [
        "Learning Latin dances and participating in cultural celebrations",
        "Traveling to experience different cultures and traditions",
        "Hosting gatherings that bring diverse people together",
        "Participating in community cultural events and festivals"
      ]
    }
  },
  "world_traditional": {
    description: "Traditional music from various cultures around the world, preserving ancient wisdom and cultural heritage.",
    characteristics: ["Traditional", "Cultural", "Ancestral", "Timeless"],
    personalityAnalysis: {
      typeTitle: "Wisdom Keeper",
      description: "You understand the deep value of traditional wisdom and cultural heritage, serving as a bridge between ancestral knowledge and contemporary needs. Traditional world music's connection to cultural roots perfectly reflects your role as a keeper and transmitter of valuable traditions.",
      coreTraits: [
        {
          traitName: "Cultural Wisdom",
          description: "You understand and preserve valuable traditional knowledge and practices",
          impact: "Providing guidance and continuity in rapidly changing times"
        },
        {
          traitName: "Timeless Perspective",
          description: "You can see beyond temporary trends to identify lasting, fundamental truths",
          impact: "Creating sustainable solutions based on proven principles"
        },
        {
          traitName: "Heritage Connection",
          description: "You maintain strong connections to cultural roots while adapting to contemporary life",
          impact: "Bridge-building between different generations and cultural perspectives"
        }
      ],
      lifestyleInsights: [
        "You value traditional practices and find wisdom in ancestral knowledge",
        "You prefer authentic, meaningful experiences over superficial entertainment",
        "You serve as a cultural bridge, helping others understand their heritage"
      ],
      strengths: [
        "Deep understanding of human nature based on traditional wisdom",
        "Natural ability to provide stability and continuity in changing environments",
        "Strong connection to community and cultural values"
      ],
      challenges: [
        "Potential difficulty adapting to rapid technological or social changes",
        "Risk of being seen as old-fashioned in progressive environments",
        "Challenge of translating traditional wisdom for contemporary applications"
      ],
      relationshipCompatibility: "You prefer partners who respect tradition and cultural values, seeking relationships that honor both heritage and personal growth.",
      musicPreferences: [
        "Traditional music that connects to cultural heritage",
        "Authentic folk music that preserves cultural stories",
        "Spiritual or ceremonial music that connects to deeper meanings"
      ],
      recommendedActivities: [
        "Learning about and participating in traditional cultural practices",
        "Teaching or sharing cultural knowledge with younger generations",
        "Participating in community cultural preservation efforts",
        "Traveling to experience authentic traditional cultures"
      ]
    }
  }
};

// 장르 ID로 영어 번역 데이터를 가져오는 함수
export function getGenreTranslation(genreId: string) {
  return genreTranslations[genreId] || null;
}

// 언어에 따라 적절한 텍스트를 반환하는 함수들
export function getGenreDescription(genreId: string, originalDescription: string, language: 'ko' | 'en'): string {
  if (language === 'ko') return originalDescription;
  const translation = getGenreTranslation(genreId);
  return translation?.description || originalDescription;
}

export function getGenreCharacteristics(genreId: string, originalCharacteristics: string[], language: 'ko' | 'en'): string[] {
  if (language === 'ko') return originalCharacteristics;
  const translation = getGenreTranslation(genreId);
  return translation?.characteristics || originalCharacteristics;
}

export function getPersonalityAnalysis(genreId: string, originalAnalysis: PersonalityAnalysisReport, language: 'ko' | 'en'): PersonalityAnalysisReport {
  if (language === 'ko') return originalAnalysis;
  const translation = getGenreTranslation(genreId);
  
  if (translation?.personalityAnalysis) {
    const translatedAnalysis = translation.personalityAnalysis;
    return {
      typeTitle: translatedAnalysis.typeTitle,
      description: translatedAnalysis.description,
      coreTraits: translatedAnalysis.coreTraits?.map(trait => ({
        traitName: trait.traitName,
        score: 0, // Default score since it's not provided in translations
        description: trait.description,
        impact: trait.impact
      })) || originalAnalysis.coreTraits,
      lifestyleInsights: translatedAnalysis.lifestyleInsights || originalAnalysis.lifestyleInsights,
      strengths: translatedAnalysis.strengths || originalAnalysis.strengths,
      challenges: translatedAnalysis.challenges || originalAnalysis.challenges,
      relationshipCompatibility: translatedAnalysis.relationshipCompatibility || originalAnalysis.relationshipCompatibility,
      musicPreferences: translatedAnalysis.musicPreferences || originalAnalysis.musicPreferences,
      recommendedActivities: translatedAnalysis.recommendedActivities || originalAnalysis.recommendedActivities
    };
  }
  
  return originalAnalysis;
}