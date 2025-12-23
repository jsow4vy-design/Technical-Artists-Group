
import type { FeaturedSession } from '../types';

export const studioPackages = [
    // Recording & Tracking (5 packages)
    { id: 1, category: "Recording & Tracking", title: "Solo Artist Demo", price: 120, priceDisplay: "$120", details: ["3-hour session", "Vocal & 1 Instrument Setup", "Access to vocal tuning software", "Stereo bounce of raw tracks"], description: "Perfect for singer-songwriters. Bring your own engineer or add one of ours." },
    { id: 2, category: "Recording & Tracking", title: "Full Band Basic Tracking", price: 300, priceDisplay: "$300", details: ["5-hour block", "Live off-the-floor setup", "Up to 5 musicians", "Use of all amps & backline"], description: "Capture the live energy of your band. Engineer not included." },
    { id: 3, category: "Recording & Tracking", title: "Drum Tracking", price: 150, priceDisplay: "$150", details: ["4-hour session", "Access to studio kit & mics", "World-class acoustic space", "Raw multitracks provided"], description: "Get massive, punchy drum sounds for your project. Bring your own engineer." },
    { id: 16, category: "Recording & Tracking", title: "4-Hour Dry Hire Block", price: 200, priceDisplay: "$200", details: ["4-hour session", "Access to live room & control room", "Use your own laptop & interface", "Bring your own engineer"], description: "The perfect blank canvas. You get our world-class rooms; you bring the personnel." },
    { id: 12, category: "Recording & Tracking", title: "Studio Rehearsal", price: 60, priceDisplay: "$60 / hour", details: ["Access to live room & PA", "Get comfortable with the space", "Dial in monitor mixes", "A pro space to practice"], description: "Practice in a professional environment with a top-tier sound system." },
    
    // Production & Mixing (5 packages)
    { id: 4, category: "Production & Mixing", title: "Single Song Production Block", price: 750, priceDisplay: "$750", details: ["Full day (8-hour) studio lockout", "Access to all mics, instruments & software", "Pre-production consultation (30 mins)", "Ideal for artists with their own engineer"], description: "A full day dedicated to bringing one song to life. You run the session." },
    { id: 5, category: "Production & Mixing", title: "EP Production Block (5 Days)", price: 3500, priceDisplay: "$3,500", details: ["5 consecutive studio days (40 hours)", "Dedicated production support", "Full access to gear library", "Perfect for a cohesive project"], description: "The ultimate creative deep-dive. Bring your engineer and craft your next record." },
    { id: 17, category: "Production & Mixing", title: "Music Video Production + BTS", price: 1200, priceDisplay: "$1,200", details: ["Full day (8-hour) studio lockout", "4K multi-camera video shoot", "Behind-the-scenes photographer", "Basic lighting package included"], description: "Create a stunning music video and get all the social content you need in one session." },
    { id: 13, category: "Production & Mixing", title: "In-House Mastering (per song)", price: 100, priceDisplay: "$100", details: ["Final polish and loudness optimization", "High-end analog & digital gear", "2 revisions included", "Delivery for all streaming platforms"], description: "The crucial final step to make your music sound great everywhere." },
    { id: 6, category: "Production & Mixing", title: "In-House Mixing (per song)", price: 250, priceDisplay: "$250", details: ["Stems mixing by our house engineer", "2 revisions included", "Analog summing for warmth", "Master-ready WAV file"], description: "Let our experienced engineers give your track a professional, polished sound." },

    // Podcasting & Voice Over (4 packages)
    { id: 7, category: "Podcasting & Voice Over", title: "Podcast Quick Start", price: 80, priceDisplay: "$80", details: ["1-hour recording session", "Up to 2 hosts", "Professional mics & headphones", "Raw audio files provided"], description: "Record your podcast episode with pristine audio quality. Just show up and talk." },
    { id: 8, category: "Podcasting & Voice Over", title: "Video Podcast Package", price: 250, priceDisplay: "$250", details: ["2-hour session", "3-camera 4K setup", "Professional lighting", "Synced audio & video files"], description: "Elevate your podcast with high-quality video. We handle the tech." },
    { id: 9, category: "Podcasting & Voice Over", title: "Voice Over Demo Reel", price: 200, priceDisplay: "$200", details: ["2-hour session", "Access to script library", "Engineer to direct & record", "Edited & master-ready files"], description: "Create a professional voice-over demo that stands out to casting directors." },
    { id: 14, category: "Podcasting & Voice Over", title: "Audiobook Recording Block", price: 250, priceDisplay: "$250", details: ["4-hour recording block", "Ultra-quiet vocal booth", "Engineer to monitor levels", "Punch-and-roll recording"], description: "Comfortable and professional space for narrating your audiobook." },

    // Engineer Add-ons (3 packages)
    { id: 10, category: "Engineer Add-ons", title: "Studio Engineer (Hourly)", price: 50, priceDisplay: "+$50 / hour", details: ["Add a professional engineer to any session", "Expertise in our gear & workflow", "Focus on your performance", "Minimum 3 hours"], description: "Let our pros handle the technical side so you can focus on creativity." },
    { id: 11, category: "Engineer Add-ons", title: "Live Stream Technician", price: 150, priceDisplay: "+$150 / event", details: ["For our Monday night fundraiser slot", "Manages audio & video streams", "Ensures a smooth broadcast", "Technical support on-site"], description: "Guarantees a high-quality, professional live stream for your performance." },
    { id: 18, category: "Engineer Add-ons", title: "Session Musician", price: 100, priceDisplay: "+$100 - $150 / hour", details: ["Pro instrumentalist for your track", "Guitar, Bass, Drums, Keys available", "Contact for specific needs", "Minimum 2 hours"], description: "Need a pro to lay down the perfect part? Our roster of session musicians can add that magic touch to your recording." },
    { id: 19, category: "Engineer Add-ons", title: "Gear Rental", price: 0, priceDisplay: "Contact for Pricing", details: ["Vintage Guitars & Amps", "Analog Synthesizers", "Specialty Microphones", "Daily & Weekly Rates available"], description: "Access our curated collection of vintage and modern gear for your session, or for off-site rental." },
];

export const studioTeam = [
    {
        id: 1,
        name: 'Moe White',
        role: 'Lead Engineer & Artist',
        imageUrl: 'https://images.unsplash.com/photo-1581599933458-2abc9b8c03b3?q=80&w=800&auto=format&fit=crop&fm=webp',
        expertise: ['Analog Recording', 'Live Band Tracking', 'Vocal Production', 'Mixing'],
        categories: ['Team', 'Artist'],
        bio: 'With over 15 years in the industry, Moe is a disciple of classic Glyn Johns and Al Schmitt recording techniques. His work has been featured on Grammy-nominated albums, and he’s the go-to for artists wanting to capture raw, authentic energy on tape.'
    },
    {
        id: 2,
        name: 'j.wav',
        role: 'Producer/Engineer & Artist',
        imageUrl: 'https://images.unsplash.com/photo-1629276301820-0f37c355e141?q=80&w=800&auto=format&fit=crop&fm=webp',
        expertise: ['Hip-Hop & Electronic Production', 'Beat Making', 'Sound Design', 'Live Streaming'],
        categories: ['Team', 'Artist'],
        bio: 'j.wav is the architect behind our modern sound. A master of DAWs and synths, he excels at building tracks from the ground up and curates our weekly DJ livestreams.'
    },
    {
        id: 3,
        name: 'Dee Strange',
        role: 'Rapper & Master Arranger',
        imageUrl: 'https://images.unsplash.com/photo-1499415474447-8313a7c36a46?q=80&w=800&auto=format&fit=crop&fm=webp',
        expertise: ['Melodic Rap', 'Arrangement', 'Songwriting', 'Vocal Production'],
        categories: ['Team', 'Artist'],
        bio: 'Dee is a rapper turned emo rap (melodic rap) master arranger, with over 300 unreleased tracks ready for release. He specializes in crafting infectious hooks and emotionally charged arrangements that define the new wave of hip-hop.'
    },
    {
        id: 4,
        name: 'INSANE',
        role: 'Tracking Engineer & Energy Architect',
        imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=800&auto=format&fit=crop&fm=webp',
        expertise: ['Heavy Metal', 'Punk', 'Distorted Textures', 'Live Energy'],
        categories: ['Team'],
        bio: 'Known for his relentless pursuit of the perfect take, INSANE specializes in aggressive genres where clarity and power are paramount. He brings a high-octane workflow to UNDR:LA, ensuring every session hits with maximum impact.'
    },
    {
        id: 5,
        name: 'Widow',
        role: 'Vocalist & Dark Pop Visionary',
        imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop&fm=webp',
        expertise: ['Dark Pop', 'Industrial', 'Melodic Arrangement', 'Songwriting'],
        categories: ['Artist'],
        bio: 'Widow is the ethereal voice of the underground. With a background in classical training and a passion for industrial electronics, she crafts haunting melodies that linger long after the track ends.'
    }
];

export const studioFaqs = [
    {
        id: 1,
        question: "Do I need to bring my own engineer?",
        answer: "Our 'Dry Hire' packages do not include an engineer, allowing you to bring your own. However, you can add one of our talented house engineers to any session for an additional hourly rate. They know our rooms and gear inside and out, which can significantly speed up your workflow."
    },
    {
        id: 2,
        question: "What's your policy on cancellations or rescheduling?",
        answer: "We require at least 48 hours' notice for any cancellations or rescheduling. Cancellations made with less than 48 hours' notice will forfeit the 50% deposit. We understand things happen, so please communicate with us as early as possible!"
    },
    {
        id: 3,
        question: "Can I bring my own gear?",
        answer: "Absolutely! We encourage you to bring any instruments or equipment you're comfortable with. We have a great selection of in-house gear, but the goal is to make you feel at home. Just let us know in advance if you're bringing large items like a drum kit or multiple amps."
    },
    {
        id: 4,
        question: "Is there parking available?",
        answer: "Yes, there is ample unmetered street parking available right outside the studio. Finding a space is usually easy, and load-in is convenient from the curb."
    },
    {
        id: 5,
        question: "Do you offer mastering services?",
        answer: "Yes, we do! Our 'In-House Mastering' service is the perfect final touch for your mixed tracks. Our engineers use a hybrid analog and digital chain to ensure your music sounds great on all streaming platforms and playback systems."
    },
    {
        id: 6,
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, bank transfers (ACH), and secure online payments via our booking portal. A 50% deposit is required to lock in your session time, with the remaining balance due upon arrival."
    },
    {
        id: 7,
        question: "Is the studio wheelchair accessible?",
        answer: "Yes, our facility is fully accessible on the ground floor, including the main live room, control room A, and restrooms. Please let us know if you have specific accessibility needs so we can ensure a comfortable experience."
    },
    {
        id: 8,
        question: "How will I receive my files?",
        answer: "We can transfer files directly to your hard drive at the end of the session (USB 3.0/USB-C recommended). Alternatively, we can provide a secure digital download link (Dropbox/WeTransfer) valid for 30 days after your session."
    },
    {
        id: 9,
        question: "Can we visit the studio before booking?",
        answer: "Of course! We offer studio tours by appointment. It's a great way to meet the team, check out the vibe, and see the gear before you commit. Contact us to schedule a walkthrough."
    },
    {
        id: 10,
        question: "Is there Wi-Fi available?",
        answer: "Yes, we have high-speed fiber internet (1Gbps up/down) available throughout the studio for client use. It's perfect for downloading reference tracks, uploading content, or livestreaming your session."
    }
];

export const featuredSessions: FeaturedSession[] = [
    {
      id: 1,
      artist: 'The Wandering Souls',
      title: 'Riverstone',
      description: 'Acoustic track captured live off-the-floor with vintage ribbon mics to preserve warmth and intimacy.',
      imageUrl: 'https://images.unsplash.com/photo-1495434942214-9b5385ba883e?q=80&w=800&auto=format&fit=crop&fm=webp',
      mediaUrl: 'https://storage.googleapis.com/maker-media/assets/sounds/soft-and-dreamy-183350.mp3',
      mediaType: 'audio'
    },
    {
      id: 2,
      artist: 'Static Bloom',
      title: 'Neon Engines',
      description: 'Full band rock production with multi-layered guitars and punchy drums from our custom kit.',
      imageUrl: 'https://images.unsplash.com/photo-1549419895-c8430a911a7a?q=80&w=800&auto=format&fit=crop&fm=webp',
      mediaUrl: 'https://storage.googleapis.com/maker-media/assets/sounds/rock-it-213562.mp3',
      mediaType: 'audio'
    },
    {
      id: 3,
      artist: 'j.wav',
      title: 'Midnight Lo-Fi',
      description: 'A smooth hip-hop instrumental created using our in-house collection of analog synths and drum machines.',
      imageUrl: 'https://images.unsplash.com/photo-1593697821252-0c91d4a1a027?q=80&w=800&auto=format&fit=crop&fm=webp',
      mediaUrl: 'https://storage.googleapis.com/maker-media/assets/sounds/lofi-chill-15024.mp3',
      mediaType: 'audio'
    },
    {
        id: 4,
        artist: 'The Tech Unfiltered Podcast',
        title: 'Episode 42: AI in Audio',
        description: 'Pristine dialogue from a multi-guest podcast, recorded with Shure SM7Bs for that classic broadcast sound.',
        imageUrl: 'https://images.unsplash.com/photo-1557761271-9c3f46b35e0e?q=80&w=800&auto=format&fit=crop&fm=webp',
        mediaUrl: 'https://storage.googleapis.com/maker-media/assets/sounds/inspiring-cinematic-ambient-116199.mp3',
        mediaType: 'audio'
      },
      {
        id: 5,
        artist: 'TAG Studios',
        title: 'Cinematic Studio Tour',
        description: 'A visual journey through our high-end facility, showcasing the gear and rooms that make our sound possible.',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop&fm=webp',
        mediaUrl: 'https://videos.pexels.com/video-files/5091632/5091632-uhd_2560_1440_25fps.mp4',
        mediaType: 'video'
      }
  ];
