import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import { NewTweetForm } from "~/components/NewTweetForm";
import { api } from "~/utils/api";
import { VscLightbulb } from "react-icons/vsc";
import { useDarkMode } from "~/styles/darkModeContext";

const TABS = ["Recent", "Following"] as const

const Home: NextPage = () => {
  const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>("Recent");
  const {darkMode, toggleDarkMode } = useDarkMode();
  const session = useSession();

  return (
    <div className={darkMode ? 'bg-gray-800 text-white min-h-screen font-sans' : 'bg-gray-50 text-gray-700 min-h-screen font-sans'}>
 <header className={darkMode ? "sticky top-0 z-10 px-6 bg-gray-800 py-4 shadow-md flex justify-between items-center" : "sticky top-0 z-10 px-6 bg-gray-50 py-4 shadow-md flex justify-between items-center"}>        <div>
          <h1 className="text-2xl font-bold">Home</h1>
          {session.status === "authenticated" && (
            <nav className="mt-4">
              <ul className="flex gap-6 text-sm font-semibold">
                {TABS.map(tab => (
                  <li key={tab} className={tab === selectedTab ? "border-b-2 border-blue-500" : ""}>
                    <button onClick={() => setSelectedTab(tab)}>{tab}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <button onClick={toggleDarkMode} className="p-2 rounded focus:outline-none">
          <VscLightbulb size={30} color={darkMode ? 'yellow' : 'black'} />
        </button>
      </header>

      <main className="py-10 px-6 md:px-12 lg:px-16 xl:px-36">
        <NewTweetForm />
        {selectedTab === "Recent" ? <RecentTweets /> : <FollowingTweets />}
      </main>
    </div>
  );
};
function RecentTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweet)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}
function FollowingTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {onlyFollowing: true},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweet)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

export default Home;