export interface WarmupTopic {
  key: string;
  subjects: string[];
  openers: string[];
  replies: string[];
  closers: string[];
}

const GREETINGS = ["Hi", "Hey", "Hello", "Good morning", "Good afternoon", "Hope you're well"];
const SIGNOFFS = ["Best", "Thanks", "Cheers", "Talk soon", "All the best", "Have a great day"];

export const WARMUP_TOPICS: WarmupTopic[] = [
  {
    key: "marketing_ideas",
    subjects: [
      "Quick thought on marketing",
      "Marketing idea I wanted to share",
      "Something interesting for marketing",
      "Re: marketing brainstorm",
      "Marketing update",
    ],
    openers: [
      "I was thinking about our marketing approach and wanted to bounce an idea off you. Have you considered trying short-form video content? It seems to be getting great traction lately.",
      "Just came across an interesting case study about email sequences. Thought it might be relevant to what we discussed last time about lead gen.",
      "I had a quick thought about our content strategy. What if we focused more on educational pieces rather than promotional ones?",
      "Been looking into some competitor campaigns and noticed a few trends worth discussing. Do you have a few minutes this week?",
      "Wanted to share something I noticed about our audience engagement. The posts with customer stories seem to perform much better.",
      "Had a conversation with a colleague about growth tactics and it reminded me of our discussion. Mind if I share some notes?",
    ],
    replies: [
      "That's a really good point. I think we should explore that further. Let me pull together some data and get back to you.",
      "Interesting perspective. I actually tried something similar last quarter and saw decent results. Happy to share what worked.",
      "Agreed on that. I'll look into it this week and follow up with some thoughts.",
      "Thanks for sharing. I've been thinking along similar lines actually. Let's sync up on this soon.",
      "Makes sense. I think the key is testing it with a small segment first to see if the numbers hold up.",
    ],
    closers: [
      "Great discussion. Let's circle back on this next week with some concrete numbers.",
      "Thanks for the insights. I'll put together a brief summary of what we discussed.",
      "Sounds like a solid plan. Looking forward to seeing the results.",
      "Perfect, I think we're aligned. Let's move forward with this approach.",
    ],
  },
  {
    key: "project_update",
    subjects: [
      "Project status update",
      "Quick update on the project",
      "Where things stand",
      "Progress check-in",
      "Update for you",
    ],
    openers: [
      "Just wanted to give you a quick update on where things stand. We've made good progress on the first phase and should be on track for the deadline.",
      "Checking in with a status update. The team has been making solid headway this week. A couple of things I wanted to flag for you.",
      "Quick heads up on the project timeline. We hit a small snag with the integration but the team is working through it. Should be resolved by end of week.",
      "Wanted to loop you in on our progress. The initial testing went well and we're moving into the next phase.",
      "Brief update from my end. The deliverables are shaping up nicely. I'll have a more detailed report ready by Friday.",
    ],
    replies: [
      "Thanks for the update. Good to hear things are progressing. Let me know if you need anything from my side.",
      "Appreciate the heads up. That timeline works for me. Keep me posted on any changes.",
      "Sounds good. I'll review the latest version and share my feedback by tomorrow.",
      "Great progress. One thing to consider is whether we need to adjust the scope given the timeline.",
      "Thanks for keeping me in the loop. Everything looks on track from what I can see.",
    ],
    closers: [
      "Thanks for the detailed update. Looking forward to seeing the final version.",
      "All looks good from my end. Let's reconnect at the end of the week.",
      "Appreciate the thorough update. I think we're in good shape.",
    ],
  },
  {
    key: "meeting_scheduling",
    subjects: [
      "Meeting this week?",
      "Can we find time to connect?",
      "Quick chat?",
      "Let's catch up",
      "Schedule a call?",
    ],
    openers: [
      "Would you have time for a quick call this week? I have a few things I'd like to discuss in person rather than over email.",
      "I was hoping we could schedule a brief meeting sometime this week. There are some updates I'd like to walk through with you.",
      "Do you have 20 minutes free this week? I'd love to get your input on something I've been working on.",
      "Wanted to see if you're available for a catch-up call. It's been a while since we last connected and I have some news to share.",
      "Can we block off some time to chat? I think it would be more efficient than going back and forth over email.",
    ],
    replies: [
      "Sure, I'm free Thursday afternoon if that works for you. How about 2pm?",
      "This week is a bit packed but I could do Friday morning. Would that work?",
      "Absolutely, let me check my calendar. I think Wednesday at 3 would work well.",
      "Happy to chat. Tomorrow after lunch would be ideal on my end. Let me know.",
      "Sounds good. I'll send over a calendar invite for later this week.",
    ],
    closers: [
      "Great, I've got it on my calendar. Looking forward to connecting.",
      "Perfect, see you then. I'll have some notes prepared.",
      "Sounds like a plan. Talk to you soon.",
    ],
  },
  {
    key: "tool_recommendation",
    subjects: [
      "Tool recommendation",
      "Have you tried this?",
      "Software suggestion",
      "Thought you might find this useful",
      "New tool I discovered",
    ],
    openers: [
      "I recently started using a new project management tool and it's been a game changer. Have you tried anything new lately?",
      "Someone recommended a really useful analytics tool to me. Thought it might be worth looking into for your team as well.",
      "Quick question - what are you currently using for task management? I'm evaluating a few options and would love your input.",
      "Found this great tool for automating reports. Saves me about 2 hours a week. Happy to share the details if you're interested.",
      "Have you come across any good tools for team collaboration recently? We're looking to switch things up.",
    ],
    replies: [
      "Oh interesting, I haven't heard of that one. I'll definitely check it out. Thanks for sharing.",
      "We've been using something similar actually. It works well for most things but has some limitations with larger teams.",
      "That sounds really useful. Could you send me the link? I'd like to take a closer look.",
      "I've been looking for something like that. What's the learning curve like?",
      "Good timing actually, we were just discussing this in our team meeting. I'll share this with the group.",
    ],
    closers: [
      "Glad I could help. Let me know how it works out for you.",
      "No problem. Feel free to reach out if you have any questions about it.",
      "Happy to chat more about it if you want a walkthrough.",
    ],
  },
  {
    key: "industry_news",
    subjects: [
      "Did you see this?",
      "Interesting industry update",
      "Thought you'd find this relevant",
      "Industry news worth noting",
      "Quick read for you",
    ],
    openers: [
      "Did you catch the news about the latest industry changes? Some interesting shifts happening that could affect our approach.",
      "Saw an article this morning that made me think of our conversation. The market seems to be moving in an interesting direction.",
      "Just read a report on emerging trends in our space. A few takeaways that I think are worth discussing.",
      "Thought you might be interested in this. There's been some notable movement in the market that could present opportunities.",
      "Have you been following the latest developments? Some of the changes coming down the pipeline could be significant.",
    ],
    replies: [
      "Yeah I saw that. It's definitely going to change how things work going forward. We should probably start planning for it.",
      "Interesting, I hadn't seen that yet. Thanks for flagging it. I'll dig into the details this afternoon.",
      "This aligns with what I've been hearing from other contacts in the industry. Seems like a real trend.",
      "Good catch. I think there's an opportunity here if we position ourselves correctly.",
      "I've been keeping an eye on this too. Let's discuss how it might impact our strategy.",
    ],
    closers: [
      "Definitely worth monitoring. Let's keep each other posted on any updates.",
      "Agreed. I'll save this thread so we can reference it later.",
      "Good discussion. It'll be interesting to see how this plays out over the next few months.",
    ],
  },
  {
    key: "team_building",
    subjects: [
      "Team event idea",
      "Team morale thoughts",
      "Building a better team culture",
      "Team activity suggestion",
      "Something for the team",
    ],
    openers: [
      "I've been thinking about ways to improve team morale. Do you have any suggestions for activities or events that have worked well for you?",
      "We're planning a team outing next month and I'm looking for ideas. What kind of events has your team enjoyed?",
      "Have you noticed how much better the team performs after we do something fun together? I want to make these more regular.",
      "Quick question about team building. We've got some new members and I want to help them integrate. Any tips?",
      "Been researching team culture best practices. Found some interesting approaches I'd love to bounce off you.",
    ],
    replies: [
      "Great idea. We did an escape room last quarter and it was surprisingly effective for team bonding.",
      "I think regular informal catch-ups work better than big events. Even a weekly virtual coffee chat can make a difference.",
      "Something that worked really well for us was having team members present their hobbies. It was fun and helped people connect.",
      "Food always works. Even something as simple as a team lunch once a month can boost morale significantly.",
      "I agree it's important. One thing that helped us was creating mentorship pairs within the team.",
    ],
    closers: [
      "These are great suggestions. I'll run them by the team and see what resonates.",
      "Thanks for the ideas. I think I'll start with the more casual approach and build from there.",
      "Really appreciate the input. Let me know how your next team event goes.",
    ],
  },
  {
    key: "client_feedback",
    subjects: [
      "Client feedback worth sharing",
      "Interesting client response",
      "Feedback from a client",
      "Client conversation summary",
      "What the client said",
    ],
    openers: [
      "Had an interesting conversation with a client today. They gave some feedback that I think could inform our approach going forward.",
      "Just got off a call with one of our key clients. The feedback was mostly positive but there were a few areas they highlighted.",
      "Wanted to share some client feedback I received this week. There's a clear pattern in what they're asking for.",
      "A client mentioned something today that I thought was worth passing along. It's about how they perceive our value proposition.",
      "Got some valuable insights from a client survey we ran. The results were pretty revealing.",
    ],
    replies: [
      "That's really valuable feedback. I think we should incorporate it into our next planning session.",
      "Interesting. Was this specific to their use case or do you think other clients feel the same way?",
      "Good to know. It's always helpful to hear directly from clients. Should we schedule a review?",
      "Thanks for sharing. This actually confirms something I've suspected for a while.",
      "I've heard similar things from my clients. Seems like there's a broader trend here.",
    ],
    closers: [
      "Let's make sure we act on this. I'll compile the key points into a summary.",
      "Thanks for passing this along. Really helps to have this perspective.",
      "Good chat. Let's make sure the team is aware of this feedback.",
    ],
  },
  {
    key: "budget_planning",
    subjects: [
      "Budget thoughts",
      "Planning for next quarter",
      "Resource allocation question",
      "Budget review",
      "Financial planning input",
    ],
    openers: [
      "Starting to think about next quarter's budget. Any areas where you think we should increase investment?",
      "Quick question about resource allocation. I'm putting together a proposal and wanted to get your perspective.",
      "Have you started planning your budget for next quarter? I'm trying to get ahead of it this time around.",
      "Looking at our spending this quarter and noticing some areas where we could optimize. Wanted to get your thoughts.",
      "I'm reviewing our vendor costs and wondering if there are better alternatives. Have you renegotiated any contracts recently?",
    ],
    replies: [
      "Good timing on this. I was just reviewing our numbers. I think there's room to reallocate some of the underperforming areas.",
      "We're in a similar position. I'd suggest looking at where we're getting the best ROI and doubling down there.",
      "I'd recommend building in some buffer for unexpected costs. We got caught out last quarter.",
      "One area I'd focus on is training. The investment pays off quickly in terms of productivity.",
      "Happy to share our approach. We've been using a priority-based allocation that's worked really well.",
    ],
    closers: [
      "Great input. I'll factor this into the proposal and share a draft soon.",
      "Thanks for the perspective. Let's compare notes once we both have our plans finalized.",
      "Appreciate the guidance. This helps a lot with the planning process.",
    ],
  },
  {
    key: "hiring_discussion",
    subjects: [
      "Hiring thoughts",
      "Team expansion",
      "Recruiting question",
      "Hiring pipeline update",
      "New role considerations",
    ],
    openers: [
      "We're looking to bring on someone new for the team. Any recommendations on where to find quality candidates?",
      "How's your hiring pipeline looking? We're having trouble finding the right fit for a couple of roles.",
      "Thinking about expanding the team next quarter. Wanted to get your advice on the process you used last time.",
      "Had a great interview today. The candidate pool seems to be improving. Are you seeing the same?",
      "Quick question about your hiring process. How do you evaluate cultural fit without making it too subjective?",
    ],
    replies: [
      "We've had good luck with referral programs. Offering a bonus to team members for successful referrals has been our best channel.",
      "I'd suggest being really specific in the job description. It saves a lot of time filtering candidates.",
      "Skills tests during the interview have been game-changing for us. Much more reliable than just talking.",
      "One thing that's worked well is having candidates meet with multiple team members, not just the hiring manager.",
      "The market is competitive right now. I'd recommend moving quickly when you find someone good.",
    ],
    closers: [
      "These are great tips. I'll update our process based on this.",
      "Really helpful, thanks. Let me know if you hear of anyone who might be a good fit.",
      "Appreciate the advice. I'll let you know how it goes.",
    ],
  },
  {
    key: "quarterly_review",
    subjects: [
      "Quarterly review prep",
      "End of quarter reflections",
      "Quarter in review",
      "Performance highlights",
      "Looking back at Q results",
    ],
    openers: [
      "Starting to prepare for our quarterly review. Any highlights or wins you'd like to make sure we include?",
      "Can't believe the quarter is almost over. How do you feel about where things landed compared to our goals?",
      "Putting together the quarterly summary and wanted to check in. What were the biggest accomplishments from your perspective?",
      "Quick thought as we wrap up the quarter. I think we should highlight the improvements in our process this time around.",
      "How's your quarter looking from a numbers standpoint? I'm cautiously optimistic about ours.",
    ],
    replies: [
      "Overall I think it was a strong quarter. The main wins were in customer retention and the product launch.",
      "Mixed results but trending positive. We missed one target but overperformed on two others.",
      "I'd say it was our best quarter this year. The changes we made early on really paid off.",
      "Not as strong as I'd hoped but we laid important groundwork for next quarter.",
      "Good question. I think the key story is the progress we made even with the challenges we faced.",
    ],
    closers: [
      "Great summary. I'll incorporate this into the presentation.",
      "Thanks for the perspective. I think we have a compelling story to tell.",
      "Sounds good. Let's make sure we set ambitious but achievable goals for next quarter.",
    ],
  },
  {
    key: "conference_planning",
    subjects: [
      "Conference coming up",
      "Event attendance",
      "Industry conference",
      "Thinking about this event",
      "Conference prep",
    ],
    openers: [
      "There's an interesting conference coming up next month. Have you heard of it? Thinking about attending.",
      "Are you going to the industry conference this year? I'm considering it but not sure if it's worth the investment.",
      "Just signed up for a virtual summit next week. The speaker lineup looks really impressive this time.",
      "Do you have any conferences on your radar for this quarter? I'm trying to be more selective about which ones to attend.",
      "Went to a great meetup last night. The networking was really valuable. Do you attend many events?",
    ],
    replies: [
      "I've been to that one before. It's definitely worth it for the networking alone. The sessions can be hit or miss though.",
      "I wasn't planning on it but you're making me reconsider. Who are the keynote speakers?",
      "Virtual events have gotten so much better. I attended one last month that was surprisingly engaging.",
      "I tend to pick one or two per year and really invest in them. Quality over quantity.",
      "That sounds interesting. Would you want to go together? It's always better to have someone to discuss the sessions with.",
    ],
    closers: [
      "Let me know if you decide to go. Would be great to catch up there.",
      "I'll send you the registration link. Early bird pricing ends this week.",
      "Good chat. Let's compare notes after the event.",
    ],
  },
  {
    key: "process_improvement",
    subjects: [
      "Process improvement idea",
      "Workflow suggestion",
      "Making things more efficient",
      "Process question",
      "Streamlining our approach",
    ],
    openers: [
      "I've been looking at our workflow and I think there are a few areas where we could streamline things. Have time to discuss?",
      "Had an idea about how we could reduce the back-and-forth in our review process. Mind if I share?",
      "We spent way too long on approvals last week. I think we need to simplify the process.",
      "Been mapping out our current workflow and noticed some redundancies. Have you experienced the same bottlenecks?",
      "What if we automated the reporting step? I think it could save everyone significant time each week.",
    ],
    replies: [
      "I've been thinking the same thing. The current process has too many hand-offs and it slows everything down.",
      "Good idea. I'd start with the biggest time sink and work from there. What do you think is the worst offender?",
      "Automation would be great if we can do it without losing the quality checks. I think there's a way.",
      "Totally agree. We simplified a similar process last year and it made a huge difference.",
      "I'm all for it. The question is whether we do it incrementally or overhaul the whole thing at once.",
    ],
    closers: [
      "Let's put together a proposal and get buy-in from the rest of the team.",
      "Great ideas. I'll draft up a process map showing the proposed changes.",
      "Sounds like we're on the same page. Let's set a deadline to have the new process in place.",
    ],
  },
  {
    key: "weekend_plans",
    subjects: [
      "Weekend plans?",
      "Got any plans this weekend?",
      "How was your weekend?",
      "Happy Friday",
      "Quick personal note",
    ],
    openers: [
      "Any fun plans for the weekend? I'm thinking about trying that new restaurant downtown.",
      "Happy Friday! Hope you have a relaxing weekend ahead. Any exciting plans?",
      "Quick non-work question - have you been to any good restaurants lately? Looking for recommendations.",
      "The weather is supposed to be amazing this weekend. Planning to finally get outside and enjoy it.",
      "Hope you had a good week. Looking forward to disconnecting a bit this weekend.",
    ],
    replies: [
      "Nice! I've heard great things about that place. Let me know how it is. I might go next week.",
      "Keeping it low key this weekend. Maybe catch up on some reading. How about you?",
      "Actually yes, there's this great spot on Main Street. The food is excellent and the atmosphere is really nice.",
      "Same here. It's been a busy week. A little downtime sounds perfect.",
      "We're planning a hike if the weather holds up. Always good to recharge.",
    ],
    closers: [
      "Have a great weekend! Let's catch up on Monday.",
      "Enjoy the time off. Talk to you next week.",
      "Sounds like a great plan. Have fun!",
    ],
  },
  {
    key: "vendor_evaluation",
    subjects: [
      "Vendor comparison",
      "Service provider question",
      "Evaluating options",
      "Vendor recommendation needed",
      "Switching providers?",
    ],
    openers: [
      "We're evaluating a few vendors for our upcoming project. Do you have any recommendations based on your experience?",
      "Thinking about switching our service provider. The current one hasn't been meeting expectations lately.",
      "Have you gone through a vendor selection process recently? I'd love to hear about your approach.",
      "Quick question - who are you using for cloud hosting? We're outgrowing our current setup.",
      "Doing some research on vendors and wanted your opinion. What matters most to you when choosing a partner?",
    ],
    replies: [
      "We switched last year and it was definitely worth the hassle. Happy to share what we learned in the process.",
      "I'd recommend getting at least three quotes and doing a proper comparison. Price isn't everything though.",
      "The onboarding process matters more than people think. A cheaper vendor with poor support ends up costing more.",
      "We've been happy with our current provider. I can make an introduction if you're interested.",
      "Good timing. We actually just completed a similar evaluation. Let me send you our comparison framework.",
    ],
    closers: [
      "Really helpful. I'll reach out to a couple of the ones you mentioned.",
      "Thanks for the recommendation. I'll set up some demos this week.",
      "Great advice. I'll keep you posted on what we end up choosing.",
    ],
  },
  {
    key: "training_development",
    subjects: [
      "Professional development",
      "Training opportunity",
      "Learning something new",
      "Skill development idea",
      "Course recommendation",
    ],
    openers: [
      "Have you taken any good courses recently? I'm looking to upskill in a couple of areas.",
      "Thinking about setting up a learning program for the team. What topics do you think would be most valuable?",
      "Just finished an online certification. It was really well put together. Would recommend it.",
      "Do you invest in professional development for your team? I'm trying to make a case for increasing our training budget.",
      "Found a great resource for learning. Thought you might be interested given our conversation last time.",
    ],
    replies: [
      "I just completed one on data analysis. Really practical and immediately applicable. I can share the link.",
      "For the team, I'd focus on skills that have immediate application. Hands-on workshops tend to stick better than lectures.",
      "We allocate time each week for learning. Even just an hour makes a difference over time.",
      "That certification sounds interesting. How long did it take to complete?",
      "I'm a big believer in continuous learning. The investment always pays off.",
    ],
    closers: [
      "Thanks for the suggestions. I'll check those out.",
      "Good chat. Let's share resources as we find them.",
      "Appreciate the recommendation. I'll start with that one.",
    ],
  },
  {
    key: "remote_work",
    subjects: [
      "Remote work thoughts",
      "Working from home tips",
      "Hybrid work setup",
      "Remote productivity",
      "Work-life balance",
    ],
    openers: [
      "How's your remote work setup going? I'm always looking for ways to improve my home office.",
      "We're transitioning to a hybrid model and trying to figure out the right balance. How does your team handle it?",
      "Found a great productivity hack for remote work. Blocking off no-meeting hours has been transformative.",
      "Do you find remote meetings as effective as in-person ones? I'm still adjusting to the format.",
      "Curious about your work-from-home routine. I'm trying to be more structured with my time.",
    ],
    replies: [
      "It took some adjustment but I actually prefer it now. The lack of commute alone saves hours each week.",
      "We do three days in office, two remote. It seems to be the sweet spot for most people on the team.",
      "The no-meeting blocks are essential. I also recommend getting a standing desk. Game changer.",
      "I think the key is having clear async communication norms so not everything needs a meeting.",
      "My routine has been evolving. I've found that starting with deep work in the morning works best.",
    ],
    closers: [
      "Great tips. I'll try implementing some of these.",
      "Thanks for sharing your approach. Always helpful to hear what works for others.",
      "Good perspective. I think flexibility is the key takeaway here.",
    ],
  },
  {
    key: "book_recommendation",
    subjects: [
      "Book recommendation",
      "Read anything good lately?",
      "Book I think you'd enjoy",
      "Reading list update",
      "Great read I wanted to share",
    ],
    openers: [
      "Just finished reading a great business book. It really changed how I think about strategy. Want the title?",
      "Do you read much? I'm building my reading list for the quarter and looking for suggestions.",
      "Someone recommended a book to me and it turned out to be exactly what I needed. Love when that happens.",
      "I know you mentioned wanting to learn more about leadership. I just read something that might be perfect.",
      "Quick recommendation in case you're looking for something to read. This one is a quick read but really impactful.",
    ],
    replies: [
      "Oh definitely share it. I've been in a reading slump and need something to get me going again.",
      "I actually just finished one on that topic. We should trade recommendations.",
      "I've heard of that one. It's been on my list for a while. Maybe this is the push I need to finally read it.",
      "Thanks for thinking of me. I'll add it to my queue. Currently working through a few others.",
      "I love a good business book. What was your biggest takeaway from it?",
    ],
    closers: [
      "I'll definitely pick that up. Thanks for the recommendation.",
      "Great swap. Let's do this more often.",
      "Happy reading! Let me know what you think when you're done.",
    ],
  },
  {
    key: "customer_strategy",
    subjects: [
      "Customer retention idea",
      "Customer experience thoughts",
      "Improving customer satisfaction",
      "Customer journey mapping",
      "Retention strategy",
    ],
    openers: [
      "I've been analyzing our customer churn data and noticed some interesting patterns. Have a minute to discuss?",
      "What's your approach to customer retention? I'm always looking for new strategies to reduce churn.",
      "Had a great interaction with a long-time customer today. It got me thinking about what keeps them loyal.",
      "We're revamping our onboarding process and I'd love your input. First impressions matter a lot.",
      "Do you do regular check-ins with your top customers? I've found it makes a huge difference.",
    ],
    replies: [
      "Churn analysis is so important. We found that most of our churn happened in the first 30 days. Fixed the onboarding and it dropped significantly.",
      "Proactive outreach is our biggest retention tool. By the time a customer complains, it's often too late.",
      "I think personalization is key. Customers want to feel like they're not just a number.",
      "We started doing quarterly business reviews with our top accounts. It's been great for relationship building.",
      "What patterns are you seeing? I'd be curious to compare with our data.",
    ],
    closers: [
      "Really insightful. I'll implement some of these ideas and let you know the results.",
      "Thanks for sharing your approach. It's clearly working based on your retention numbers.",
      "Great discussion. Let's compare notes again next quarter.",
    ],
  },
  {
    key: "wellness_check",
    subjects: [
      "How are you doing?",
      "Just checking in",
      "Touching base",
      "Hope things are going well",
      "Quick check-in",
    ],
    openers: [
      "Hey, just wanted to check in and see how things are going on your end. Hope everything is well.",
      "It's been a while since we last chatted. How have things been?",
      "Hope you're having a good week so far. Anything exciting happening?",
      "Just thinking about you and wanted to reach out. How's everything going?",
      "Quick check-in to say hi. I know things have been busy lately.",
    ],
    replies: [
      "Thanks for checking in! Things are going well. Been busy but in a good way. How about you?",
      "Appreciate you reaching out. Things are great. Just wrapped up a big project so feeling good.",
      "Hey! Nice to hear from you. Everything is solid. Let's catch up properly soon.",
      "Doing well, thanks. The team is in a good rhythm right now. How are things on your side?",
      "That's really kind of you. I'm doing great actually. Been feeling productive lately.",
    ],
    closers: [
      "Glad to hear it. Let's get together soon.",
      "Good to catch up, even briefly. Talk soon!",
      "Great to hear from you. Don't be a stranger.",
    ],
  },
  {
    key: "product_feedback",
    subjects: [
      "Product improvement idea",
      "Feature suggestion",
      "Product feedback",
      "Enhancement request",
      "Something users are asking for",
    ],
    openers: [
      "Got some interesting feedback from users about a feature they'd love to see. Thought I'd share it with you.",
      "I've been collecting user feedback and there's a clear pattern emerging. People are asking for better reporting.",
      "Had an idea for improving the user experience. What if we simplified the main dashboard?",
      "Users keep mentioning the same pain point. I think we should prioritize it for next sprint.",
      "The latest NPS scores are in. Overall positive but there's one area that keeps coming up.",
    ],
    replies: [
      "That's great feedback. I've been hearing similar things. Let's add it to the roadmap discussion.",
      "Simplifying the dashboard is something I've been advocating for. Glad users are echoing it.",
      "We should probably set up a user interview to dig deeper into this. The surface-level feedback might not tell the whole story.",
      "Good call on prioritizing it. Sometimes the small improvements have the biggest impact on satisfaction.",
      "I'll bring this up in our next product meeting. It aligns with our strategic goals for the quarter.",
    ],
    closers: [
      "Let's make sure this gets on the roadmap. I'll draft a brief proposal.",
      "Thanks for flagging this. User feedback is gold.",
      "Agreed on next steps. Let's move on this quickly.",
    ],
  },
];

export function pickRandomTopic(): WarmupTopic {
  return WARMUP_TOPICS[Math.floor(Math.random() * WARMUP_TOPICS.length)];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateWarmupEmail(opts: {
  topic: WarmupTopic;
  turnNumber: number;
  maxTurns: number;
  senderName: string;
  receiverName: string;
}): { subject: string; body: string } {
  const { topic, turnNumber, maxTurns, senderName, receiverName } = opts;

  // Pick subject (only use full subject on turn 0, add Re: for replies)
  const baseSubject = pickRandom(topic.subjects);
  const subject = turnNumber === 0 ? baseSubject : `Re: ${baseSubject}`;

  // Pick greeting
  const greeting = pickRandom(GREETINGS);
  const name = receiverName || "there";
  const greetingLine = Math.random() > 0.3 ? `${greeting} ${name},` : `${greeting},`;

  // Pick body content based on turn
  let bodyContent: string;
  if (turnNumber === 0) {
    bodyContent = pickRandom(topic.openers);
  } else if (turnNumber >= maxTurns - 1) {
    bodyContent = pickRandom(topic.closers);
  } else {
    bodyContent = pickRandom(topic.replies);
  }

  // Pick sign-off
  const signoff = pickRandom(SIGNOFFS);
  const senderDisplay = senderName || "Me";

  // Build body
  let body = `${greetingLine}\n\n${bodyContent}\n\n${signoff},\n${senderDisplay}`;

  // Occasional PS line (10% chance, only on openers)
  if (turnNumber === 0 && Math.random() < 0.1) {
    const psLines = [
      "P.S. Let me know if you need anything else.",
      "P.S. Hope you're having a great week!",
      "P.S. No rush on this, whenever you have a chance.",
      "P.S. Feel free to forward this to anyone else who might find it useful.",
    ];
    body += `\n\n${pickRandom(psLines)}`;
  }

  return { subject, body };
}
