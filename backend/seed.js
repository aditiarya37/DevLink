const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Import Models
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const Comment = require("./models/Comment.js");
const Notification = require("./models/Notification.js");
const connectDB = require("./config/db.js");

dotenv.config();

// ==========================================
// 1. MASSIVE DATA DICTIONARIES
// ==========================================

const firstNames = [
  "Aarav",
  "Aditi",
  "Liam",
  "Emma",
  "Noah",
  "Olivia",
  "Rahul",
  "Priya",
  "Vikram",
  "Neha",
  "Rohan",
  "Sanya",
  "James",
  "Sophia",
  "Arjun",
  "Ananya",
  "William",
  "Ava",
  "Karan",
  "Sneha",
  "Lucas",
  "Mia",
  "Kabir",
  "Zara",
  "Benjamin",
  "Charlotte",
  "Aryan",
  "Diya",
  "Elijah",
  "Amelia",
  "David",
  "Sarah",
  "Michael",
  "Jessica",
  "John",
  "Emily",
  "Daniel",
  "Chloe",
  "Matthew",
  "Grace",
  "Samuel",
  "Lily",
  "Joseph",
  "Nora",
  "Carter",
  "Hannah",
  "Wyatt",
  "Zoe",
];
const lastNames = [
  "Sharma",
  "Smith",
  "Patel",
  "Johnson",
  "Verma",
  "Williams",
  "Gupta",
  "Brown",
  "Singh",
  "Jones",
  "Kumar",
  "Garcia",
  "Malhotra",
  "Miller",
  "Iyer",
  "Davis",
  "Reddy",
  "Rodriguez",
  "Das",
  "Martinez",
  "Nair",
  "Hernandez",
  "Mehta",
  "Lopez",
  "Jain",
  "Gonzalez",
  "Chopra",
  "Wilson",
  "Saxena",
  "Anderson",
  "Taylor",
  "Thomas",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
];
const companies = [
  "Google",
  "Meta",
  "Amazon",
  "Netflix",
  "Apple",
  "Microsoft",
  "Stripe",
  "Spotify",
  "Vercel",
  "Supabase",
  "GitHub",
  "GitLab",
  "Atlassian",
  "Slack",
  "Discord",
  "OpenAI",
  "Anthropic",
  "Tesla",
  "SpaceX",
  "Palantir",
];
const locations = [
  "San Francisco, CA",
  "New York, NY",
  "London, UK",
  "Bengaluru, India",
  "Berlin, Germany",
  "Toronto, Canada",
  "Austin, TX",
  "Seattle, WA",
  "Remote",
  "Amsterdam, Netherlands",
  "Singapore",
  "Sydney, Australia",
];
const jobTitles = [
  "Frontend Engineer",
  "Backend Developer",
  "Full Stack Engineer",
  "DevOps Specialist",
  "Machine Learning Engineer",
  "Data Scientist",
  "Cloud Architect",
  "Staff Software Engineer",
  "Engineering Manager",
  "UI/UX Developer",
  "Systems Engineer",
  "Security Researcher",
];
const universities = [
  "Stanford University",
  "MIT",
  "UC Berkeley",
  "Carnegie Mellon",
  "IIT Bombay",
  "IIT Delhi",
  "University of Waterloo",
  "Oxford University",
  "Cambridge University",
  "National University of Singapore",
  "ETH Zurich",
];
const degrees = [
  "B.S. Computer Science",
  "M.S. Software Engineering",
  "Ph.D. Artificial Intelligence",
  "B.Tech Information Technology",
  "M.S. Data Science",
  "B.A. Mathematics",
  "B.S. Cognitive Science",
];

const techStacks = [
  "React",
  "Node.js",
  "Python",
  "Django",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "TypeScript",
  "Rust",
  "Go",
  "Vue.js",
  "Angular",
  "Next.js",
  "GraphQL",
  "Tailwind CSS",
  "Redis",
  "Kafka",
  "Elasticsearch",
  "C++",
  "Java",
  "Spring Boot",
  "Kotlin",
  "Swift",
  "Flutter",
  "React Native",
];

const postImages = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1618477247222-ac60c6285740?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1200",
];

const postContentTemplates = [
  "I've spent the last 3 months diving deep into {tech}. The architecture is incredible, but the learning curve is steeper than I expected. Does anyone have recommendations for advanced patterns, specifically regarding memory management and scaling?",
  "Hot take: We over-engineer our applications. I just replaced a massive microservices cluster with a monolithic {tech} backend and our latency dropped by 60%. Sometimes boring technology is the best technology.",
  "Finally open-sourcing my side project! It's a CLI tool built with {tech} that automates database migrations and rollback testing. Check out the snippet below for how the core engine works. Feedback is highly appreciated! 🚀",
  "Debugging is like being the detective in a crime movie where you are also the murderer. Just spent 5 hours tracing a memory leak in our production {tech} environment only to find I forgot to clear an interval. 🤦‍♂️",
  "System design question for the seniors here: If you are building a real-time chat application with millions of concurrent connections, would you choose {tech} or WebSockets with Redis Pub/Sub? Here is the architecture I am currently considering.",
  "Just passed my {tech} certification! 🎉 It took months of studying late nights after work, but it was absolutely worth it. Next stop: building a full-stack SaaS platform.",
  "Why is configuring {tech} so frustrating? I swear I've read the documentation 5 times and I'm still getting peer dependency conflicts. If anyone is a master at this, please send help.",
  "I love how {tech} handles state management. It feels so much more intuitive than the alternatives. I wrote a quick helper function today that perfectly encapsulates our async logic.",
  "Is {tech} dying? I've been seeing a lot of trend reports suggesting that developers are migrating away from it. What are your thoughts? Are we moving towards a post-{tech} era?",
  "Refactored our entire legacy codebase to use {tech} today. The developer experience is night and day. TypeScript support is flawless, and the community plugins saved us weeks of work.",
];

const codeSnippets = [
  {
    lang: "javascript",
    code: "const fetchUserData = async (userId) => {\n  try {\n    const response = await api.get(`/users/${userId}`);\n    return response.data;\n  } catch (error) {\n    console.error('Failed to fetch user:', error);\n    throw error;\n  }\n};",
  },
  {
    lang: "python",
    code: "def calculate_throughput(requests, time_window):\n    if time_window <= 0:\n        raise ValueError('Time window must be positive')\n    return len(requests) / time_window\n\nprint(f'RPS: {calculate_throughput(logs, 60)}')",
  },
  {
    lang: "typescript",
    code: "interface PostPayload {\n  id: string;\n  content: string;\n  tags: string[];\n  author: User;\n}\n\nexport const createPost = (payload: PostPayload): void => {\n  db.insert(payload);\n};",
  },
  {
    lang: "rust",
    code: 'fn main() {\n    let mut numbers = vec![1, 2, 3];\n    numbers.push(4);\n    println!("Numbers: {:?}", numbers);\n}',
  },
  {
    lang: "go",
    code: 'func handleRequest(w http.ResponseWriter, r *http.Request) {\n    w.Header().Set("Content-Type", "application/json")\n    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})\n}',
  },
  {
    lang: "css",
    code: ".glass-panel {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n}",
  },
];

const commentTemplates = [
  "This is exactly what I needed today. Thanks for sharing!",
  "I strongly disagree with your approach. Using {tech} here introduces unnecessary coupling. Have you considered event-driven architecture?",
  "Can you share the GitHub repo for this? I'd love to contribute.",
  "I ran into this exact same issue last year. The documentation is terrible, but once you figure it out, it works flawlessly.",
  "Incredible work! 🔥 The UI looks incredibly crisp. Did you use Tailwind for this?",
  "This code snippet has a slight bug on line 4. If the variable is undefined, it will throw an unhandled promise rejection.",
  "Absolutely! People always chase the shiny new frameworks, but standard {tech} gets the job done reliably.",
  "I've been meaning to learn this. How long did it take you to get comfortable with it?",
  "Bookmarked. I'm literally going to use this in my sprint tomorrow.",
  "This is why I love this platform. Real developers sharing real solutions. Keep it up!",
];

const replyTemplates = [
  "Good catch! I'll update the snippet now.",
  "I did use Tailwind! Good eye.",
  "I considered event-driven architecture, but it felt like overkill for the MVP phase.",
  "It took me about 3 weeks of solid practice to wrap my head around it.",
  "DM me, I'll send you the repo link. It's currently private.",
];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, min, max) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * (max - min + 1)) + min);
};
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// ==========================================
// 3. MAIN SEED PROCESS
// ==========================================

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("\n========================================");
    console.log("🚀 INITIATING DEEP SEED PROTOCOL...");
    console.log("========================================\n");

    // WIPE DB
    console.log("🗑️  Wiping existing database collections...");
    await Notification.deleteMany({});
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    console.log("✅ Clean slate achieved.\n");

    // PRE-HASH PASSWORD FOR SPEED (Since insertMany bypasses pre('save') hooks)
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync("Password123!", salt);

    // ------------------------------------------
    // GENERATE USERS
    // ------------------------------------------
    console.log("👥 Generating 250 Detailed User Profiles...");
    const usersPayload = [];
    for (let i = 0; i < 250; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const safeFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const safeLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");

      // Enforce 20 char limit exactly
      let baseUser = `${safeFirst}_${safeLast}`;
      if (baseUser.length > 15) baseUser = baseUser.substring(0, 15);
      const username = `${baseUser}_${i}`;

      const mainTech = getRandomElement(techStacks);

      usersPayload.push({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        email: `${username}@devlink.local`,
        password: hashedPassword,
        authProvider: "local",
        displayName: `${firstName} ${lastName}`,
        profilePicture: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff&size=200`,
        bio: `${getRandomElement(jobTitles)} at ${getRandomElement(companies)}. Specializing in ${mainTech} and scalable systems. Always learning.`,
        location: getRandomElement(locations),
        skills: getRandomSubset(techStacks, 3, 7),
        links: {
          github: `https://github.com/${username}`,
          linkedin: `https://linkedin.com/in/${username}`,
          website: `https://${username}.dev`,
        },
        experience: [
          {
            title: getRandomElement(jobTitles),
            company: getRandomElement(companies),
            location: getRandomElement(locations),
            startDate: "2021-01-01",
            endDate: null, // Present
            description: `Leading backend architecture scaling services for millions of users using ${mainTech}.`,
          },
        ],
        education: [
          {
            institution: getRandomElement(universities),
            degree: getRandomElement(degrees),
            fieldOfStudy: "Computer Science",
            startDate: "2016-08-01",
            endDate: "2020-05-01",
            grade: "3.8 GPA",
          },
        ],
        followers: [],
        following: [],
        createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      });
    }

    // Insert Users
    const insertedUsers = await User.insertMany(usersPayload);
    const userIds = insertedUsers.map((u) => u._id);
    console.log(`✅ Successfully injected 250 Users.\n`);

    // ------------------------------------------
    // GENERATE FOLLOWERS & NOTIFICATIONS
    // ------------------------------------------
    console.log("🕸️  Weaving the social graph (Followers & Following)...");
    const bulkUserUpdates = [];
    const followNotifications = [];

    insertedUsers.forEach((user) => {
      // Each user follows 5 to 30 random people
      const followingIds = getRandomSubset(
        userIds.filter((id) => id !== user._id),
        5,
        30,
      );
      user.following = followingIds;

      bulkUserUpdates.push({
        updateOne: {
          filter: { _id: user._id },
          update: { following: followingIds },
        },
      });

      // Add followers to the targets and create notifications
      followingIds.forEach((targetId) => {
        bulkUserUpdates.push({
          updateOne: {
            filter: { _id: targetId },
            update: { $push: { followers: user._id } },
          },
        });
        followNotifications.push({
          recipient: targetId,
          sender: user._id,
          type: "follow",
          read: Math.random() > 0.5,
          createdAt: randomDate(user.createdAt, new Date()),
        });
      });
    });

    await User.bulkWrite(bulkUserUpdates);
    if (followNotifications.length > 0)
      await Notification.insertMany(followNotifications);
    console.log(
      `✅ Generated ${followNotifications.length} social connections.\n`,
    );

    // ------------------------------------------
    // GENERATE POSTS
    // ------------------------------------------
    console.log("📝 Creating rich timeline posts (Images, Code, Likes)...");
    const postsPayload = [];

    // ~750 Posts (3 per user on average)
    for (let i = 0; i < 750; i++) {
      const authorId = getRandomElement(userIds);
      const tech = getRandomElement(techStacks);
      const template = getRandomElement(postContentTemplates);
      let content = template.replace(/{tech}/g, tech);

      // Inject random Mentions occasionally
      let mentionedUsers = [];
      if (Math.random() > 0.8) {
        const mentionedUser = getRandomElement(insertedUsers);
        content += `\n\nShoutout to @@@${mentionedUser.username}@@@ for helping me with this!`;
        mentionedUsers.push(mentionedUser._id);
      }

      const hasCode = Math.random() > 0.6; // 40% chance of code
      const snippet = hasCode ? getRandomElement(codeSnippets) : undefined;

      const hasImage = !hasCode && Math.random() > 0.5; // 50% chance of image if no code
      const mediaUrl = hasImage ? getRandomElement(postImages) : undefined;

      // Likes (5 to 40 random likers)
      const likers = getRandomSubset(userIds, 5, 40);

      postsPayload.push({
        _id: new mongoose.Types.ObjectId(),
        user: authorId,
        content: content,
        codeSnippet: snippet
          ? { language: snippet.lang, code: snippet.code }
          : undefined,
        tags: [tech.toLowerCase(), "programming", "devlink"],
        mediaUrl: mediaUrl,
        likes: likers,
        likeCount: likers.length,
        commentCount: 0, // Calculated later
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        _mentions: mentionedUsers, // Temp field for notifications
        _likers: likers, // Temp field for notifications
      });
    }

    await Post.insertMany(postsPayload);
    console.log(`✅ Successfully injected 750 Posts.\n`);

    // Process Post Notifications (Mentions & Likes)
    // FIX: Iterate over postsPayload to access non-schema temporary variables
    const postActionNotifications = [];
    postsPayload.forEach((post) => {
      // Like Notifications
      post._likers.forEach((likerId) => {
        if (likerId.toString() !== post.user.toString()) {
          postActionNotifications.push({
            recipient: post.user,
            sender: likerId,
            type: "like_post",
            post: post._id,
            read: Math.random() > 0.5,
          });
        }
      });
      // Mention Notifications
      post._mentions.forEach((mentionId) => {
        if (mentionId.toString() !== post.user.toString()) {
          postActionNotifications.push({
            recipient: mentionId,
            sender: post.user,
            type: "mention_in_post",
            post: post._id,
            read: Math.random() > 0.5,
          });
        }
      });
    });
    if (postActionNotifications.length > 0)
      await Notification.insertMany(postActionNotifications);

    // ------------------------------------------
    // GENERATE COMMENTS & REPLIES
    // ------------------------------------------
    console.log("💬 Simulating community discussions (Comments & Replies)...");
    const commentsPayload = [];
    const commentNotifications = [];
    const postCommentCounts = {};

    // FIX: Iterate over postsPayload here as well
    postsPayload.forEach((post) => {
      postCommentCounts[post._id] = 0;

      // Generate 2 to 8 top-level comments per post
      const numComments = Math.floor(Math.random() * 7) + 2;
      for (let i = 0; i < numComments; i++) {
        const commenter = getRandomElement(insertedUsers);
        const tech = getRandomElement(techStacks);
        const text = getRandomElement(commentTemplates).replace(
          /{tech}/g,
          tech,
        );
        const topLevelCommentId = new mongoose.Types.ObjectId();

        commentsPayload.push({
          _id: topLevelCommentId,
          user: commenter._id,
          post: post._id,
          text: text,
          parentComment: null,
          depth: 0,
          replyCount: 0, // Updated if replies happen
          createdAt: randomDate(post.createdAt, new Date()),
        });
        postCommentCounts[post._id]++;

        if (commenter._id.toString() !== post.user.toString()) {
          commentNotifications.push({
            recipient: post.user,
            sender: commenter._id,
            type: "comment_post",
            post: post._id,
            comment: topLevelCommentId,
            read: Math.random() > 0.5,
          });
        }

        // 40% chance this comment gets a reply
        if (Math.random() > 0.6) {
          const replier = getRandomElement(insertedUsers);
          const replyText = getRandomElement(replyTemplates);
          const replyId = new mongoose.Types.ObjectId();

          commentsPayload.push({
            _id: replyId,
            user: replier._id,
            post: post._id,
            text: replyText,
            parentComment: topLevelCommentId,
            depth: 1,
            replyCount: 0,
            createdAt: randomDate(post.createdAt, new Date()),
          });
          postCommentCounts[post._id]++;

          // Find the index of the top level comment in payload to increase its reply count
          const parentIndex = commentsPayload.findIndex(
            (c) => c._id === topLevelCommentId,
          );
          if (parentIndex !== -1) commentsPayload[parentIndex].replyCount++;

          if (replier._id.toString() !== commenter._id.toString()) {
            commentNotifications.push({
              recipient: commenter._id,
              sender: replier._id,
              type: "reply_comment",
              post: post._id,
              comment: replyId,
              read: Math.random() > 0.5,
            });
          }
        }
      }
    });

    await Comment.insertMany(commentsPayload);
    if (commentNotifications.length > 0)
      await Notification.insertMany(commentNotifications);
    console.log(
      `✅ Successfully injected ${commentsPayload.length} Comments.\n`,
    );

    // Sync Post Comment Counts
    console.log("🔄 Syncing comment counts on posts...");
    const bulkPostUpdates = [];
    for (const [postId, count] of Object.entries(postCommentCounts)) {
      bulkPostUpdates.push({
        updateOne: {
          filter: { _id: postId },
          update: { commentCount: count },
        },
      });
    }
    await Post.bulkWrite(bulkPostUpdates);

    console.log("\n========================================");
    console.log("🎉 SEEDING COMPLETE! THE MATRIX IS ONLINE.");
    console.log(`👤 Users: 250`);
    console.log(`📝 Posts: ${postsPayload.length}`);
    console.log(`💬 Comments: ${commentsPayload.length}`);
    console.log(
      `🔔 Notifications: ${followNotifications.length + postActionNotifications.length + commentNotifications.length}`,
    );
    console.log("========================================");
    console.log("🔑 TEST ACCOUNT DETAILS:");
    console.log(
      `   Username: ${insertedUsers[0].username} (or any generated username)`,
    );
    console.log("   Password: Password123!");
    console.log("========================================\n");

    process.exit();
  } catch (error) {
    console.error("❌ FATAL SEED ERROR:", error);
    process.exit(1);
  }
};

seedDatabase();
