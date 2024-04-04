/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import InfiniteScroll from "react-infinite-scroll-component";
import { ProfileImage } from "./ProfileImage";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { VscHeart, VscHeartFilled } from "react-icons/vsc";
import { IconHoverEffect } from "./IconHoverEffect";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./LoadingSpinner";

type Tweet = {
    id: string,
    content: string,
    createdAt: Date,
    likesCount: number,
    likedByMe: boolean
    user: {id: string; image: string | null; name: string | null};
}

type InfiniteTweetListProps = {
    isError: boolean,
    isLoading: boolean,
    hasMore: boolean,
    fetchNewTweets: () => Promise<unknown>
    tweets?: Tweet[]
}

export function InfiniteTweetList({tweets , isError, isLoading, hasMore, fetchNewTweets}: InfiniteTweetListProps) {
    if (isLoading) return <LoadingSpinner big = {true}/>
    if(isError) return <h1>Error</h1>
    if(tweets == null || tweets.length == 0) return <h2 className="my-4 text-center text-2x1 text-gray-500">No Tweets</h2>

    return (<ul>

    <InfiniteScroll
        dataLength = {tweets.length}
        next = {fetchNewTweets}
        hasMore = {hasMore}
        loader = {<LoadingSpinner big={true}/>} >
            {tweets.map(tweet => {
               return <TweetCard key = {tweet.id} {...tweet}/>
            })}
    </InfiniteScroll>
    </ul> 
    );
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {dateStyle: "short"})

function TweetCard ({
    id,
    user, 
    content, 
    createdAt, 
    likesCount, 
    likedByMe}: Tweet) {

    const trpcUtils = api.useUtils()
    const toggleLike = api.tweet.toggleLike.useMutation({ onSuccess: ({addedLike}) => {
        const updateData: Parameters<typeof trpcUtils.tweet.infiniteFeed.setInfiniteData>[1] = (oldData) => {
            if(oldData == null) return;

            const countModifier = addedLike ? 1 : -1

            return {...oldData, 
            pages: oldData.pages.map((page) => {
                return {
                    ...page,
                    tweets: page.tweet.map((tweet) => {
                        if(tweet.id === id) {
                            return {
                                ...tweet,
                                likeCount: tweet.likesCount + countModifier,
                                likedByMe: addedLike
                            }
                        }

                        return tweet
                    })
                }
            })}
        }
         trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
         trpcUtils.tweet.infiniteFeed.setInfiniteData({onlyFollowing: true}, updateData);
         trpcUtils.tweet.infiniteProfileFeed.setInfiniteData({userId: user.id}, updateData);
    }})   


    function handleToggleLike() {
        toggleLike.mutate({ id })
    }

    return <li className="flex gp-4 border-b px-4 py-4">
    <Link href = {`/profiles/${user.id}`}>
        <ProfileImage src = {user.image}/>
    </Link>
    <div className="flex flex-grow flex-col ml-3">
        <div className="flex gap-1">
            <Link href={`/profiles/${user.id}`} className = "font-bold hover:underline focus-visible:underline outline-none">
                {user.name}
            </Link>
            <span className="text-gray-500">-</span>
            <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap">{content}</p>
        <HeartButton onClick = {handleToggleLike} likedByMe= {likedByMe} likeCount={likesCount}/>
    </div>
    </li>
}

type HeartButtonProps = {
    onClick: () => void,
    likedByMe: boolean,
    likeCount: number
}

function HeartButton({likedByMe, likeCount, onClick}: HeartButtonProps) {
    const session = useSession();
    const HeartIcon = likedByMe ? VscHeartFilled : VscHeart
    
    if(session.status !== "authenticated") {
        return <div className="mb-1 mt-1 flex gap-3 items-center self-start text-gray-500">
            <HeartIcon/>
            <span>{likeCount}</span>
        </div>
    }
    return (
        <button
        onClick = {onClick} 
        className= {`-ml-2 group items-center flex gap-1 transition-colors self-start duration-200 
        ${likedByMe 
            ? "text-red-500" 
            : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"}`}>

        <IconHoverEffect red>

        <HeartIcon className={`transition-colors duration-200 ${likedByMe 
            ? "fill-red-500" 
            : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"}`}/>
        
        </IconHoverEffect>
        <span>{likeCount}</span>
        </button>
    )
}
