import { PostComposer } from "./PostComposer";
import { Post } from "./Post";

const samplePosts = [
  {
    author: "Decentralized Dev",
    username: "decentdev",
    time: "2h",
    content: "Just deployed my first dApp on Plebbit! The decentralized future is looking bright 🚀\n\nNo more centralized censorship, no more single points of failure. This is what the internet was meant to be.",
    likes: 247,
    reposts: 89,
    replies: 32,
    isLiked: true,
  },
  {
    author: "Privacy Advocate",
    username: "privacyfirst",
    time: "4h",
    content: "Reminder: Your data should belong to YOU, not big tech corporations.\n\nPlebbit is proving that we can have social networks without sacrificing privacy. 💪",
    likes: 156,
    reposts: 43,
    replies: 18,
  },
  {
    author: "Web3 Builder",
    username: "web3builder",
    time: "6h",
    content: "The beauty of decentralized social networks:\n\n✅ Censorship resistant\n✅ User-owned data\n✅ Open source\n✅ Community governed\n\nThis is the way forward! #Web3 #Decentralization",
    likes: 324,
    reposts: 127,
    replies: 45,
    isReposted: true,
  },
  {
    author: "Crypto Enthusiast",
    username: "cryptofan",
    time: "8h",
    content: "GM! ☀️\n\nAnother day, another step towards a decentralized future. Grateful to be part of this community building the next generation of the internet.",
    likes: 89,
    reposts: 23,
    replies: 12,
  },
  {
    author: "Tech Journalist",
    username: "techjournalist",
    time: "12h",
    content: "Just wrote an article about the rise of decentralized social networks. Plebbit is definitely one to watch!\n\nThe shift from Web2 to Web3 social is happening faster than most people realize.",
    likes: 445,
    reposts: 178,
    replies: 67,
  },
];

export function Feed() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-twitter-border bg-background/80 backdrop-blur-md px-4 py-3">
        <h1 className="text-xl font-bold text-foreground">Home</h1>
      </div>

      {/* Post Composer */}
      <PostComposer />

      {/* Posts */}
      <div>
        {samplePosts.map((post, index) => (
          <Post key={index} {...post} />
        ))}
      </div>
    </div>
  );
}