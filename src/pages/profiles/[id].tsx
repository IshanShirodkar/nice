import type {
    GetStaticPaths,
    GetStaticPropsContext,
    InferGetStaticPropsType,
    NextPage,
  } from "next";
  import Head from "next/head";
  import { ssgHelper } from "~/server/api/ssgHelper";
  import { api } from "~/utils/api";
  import ErrorPage from "next/error";
  import Link from "next/link";
  import { IconHoverEffect } from "~/components/IconHoverEffect";
  import { VscArrowLeft } from "react-icons/vsc";
  import { ProfileImage } from "~/components/ProfileImage";
  import { InfiniteTweetList } from "~/components/InfiniteTweetList";
  import { useSession } from "next-auth/react";
  import { Button } from "~/components/Button";
  import { useDarkMode } from "~/styles/darkModeContext";
  
  const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
    id,
  }) => {
    const{darkMode} = useDarkMode();
    const { data: profile } = api.profile.getById.useQuery({ id });
    const tweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
      { userId: id },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );
    const trpcUtils = api.useUtils();
    const toggleFollow = api.profile.toggleFollow.useMutation({
      onSuccess: ({ addedFollow }) => {
        trpcUtils.profile.getById.setData({ id }, (oldData) => {
          if (oldData == null) return;
  
          const countModifier = addedFollow ? 1 : -1;
          return {
            ...oldData,
            isFollowing: addedFollow,
            followersCount: oldData.followersCount + countModifier,
          };
        });
      },
    });
  
    if (profile == null) {
      return <ErrorPage statusCode={404} />;
    }
  
    return (
      <>
      <div className={darkMode? 'bg-gray-800 text-white min-h-screen font-sans' : 'bg-gray-50 text-gray-700 min-h-screen font-sans'}>
        <Head>
          <title>{`Twitter Clone - ${profile.name}`}</title>
        </Head>
        <header className={darkMode? "sticky top-0 z-10 flex items-center border-b border-gray-600 px-4 py-7 " : "sticky top-0 z-10 flex items-center border-b px-4 py-2"}>
          <Link href=".." className="mr-2">
            <IconHoverEffect>
              <VscArrowLeft className="h-6 w-6" />
            </IconHoverEffect>
          </Link>
          <ProfileImage src={profile.image} className="flex-shrink-0" />
          <div className="ml-2 flex-grow">
            <h1 className="text-lg font-bold">{profile.name}</h1>
            <div className="text-gray-500">
              {profile.tweetsCount}{" "}
              {getPlural(profile.tweetsCount, "Tweet", "Tweets")} -{" "}
              {profile.followersCount}{" "}
              {getPlural(profile.followersCount, "Follower", "Followers")} -{" "}
              {profile.followsCount} Following
            </div>
          </div>
          <FollowButton
            isFollowing={profile.isFollowing}
            userId={id}
            onClick={() => toggleFollow.mutate({ userId: id })}
          />
        </header>
        <main>
          <InfiniteTweetList
            tweets={tweets.data?.pages.flatMap((page) => page.tweet)}
            isError={tweets.isError}
            isLoading={tweets.isLoading}
            hasMore={tweets.hasNextPage}
            fetchNewTweets={tweets.fetchNextPage}
          />
        </main>
        </div>
      </>
    );
  };
  
  function FollowButton({
    userId,
    isFollowing,
    onClick,
  }: {
    userId: string;
    isFollowing: boolean;
    onClick: () => void;
  }) {
    const session = useSession();
  
    if (session.status !== "authenticated" || session.data.user.id === userId) {
      return null;
    }
  
    return (
      <Button  onClick={onClick} small gray={isFollowing}>
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    );
  }
  
  const pluralRules = new Intl.PluralRules();
  function getPlural(number: number, singular: string, plural: string) {
    return pluralRules.select(number) === "one" ? singular : plural;
  }
  
  export const getStaticPaths: GetStaticPaths = () => {
    return {
      paths: [],
      fallback: "blocking",
    };
  };
  
  export async function getStaticProps(
    context: GetStaticPropsContext<{ id: string }>
  ) {
    const id = context.params?.id;
  
    if (id == null) {
      return {
        redirect: {
          destination: "/",
        },
      };
    }
  
    const ssg = ssgHelper();
    await ssg.profile.getById.prefetch({ id });
  
    return {
      props: {
        trpcState: ssg.dehydrate(),
        id,
      },
    };
  }
  
  export default ProfilePage;