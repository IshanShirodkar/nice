/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import { type FormEvent, useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import sentiment from "sentiment"

type AnalyzeSentimentFunction = (text: string) => Promise<string>;

function updateTextAreaSize(textArea? : HTMLTextAreaElement) {
    if(textArea == null) return
    textArea.style.height = "0"
    textArea.style.height = `${textArea.scrollHeight}px`
}

export function NewTweetForm() {
    const session = useSession();
    if(session.status !== "authenticated") return null;

    const analyzeSentiment: AnalyzeSentimentFunction = async (text: string) => {
        
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sentiment = require('sentiment');
        const sentiment = new Sentiment();
        const result = sentiment.analyze(text);

        return result.score > 0 ? "positive" : "negative";
    }

    return <Form analyzeSentiment={analyzeSentiment} />;

};
    
  

interface FormProps {
    analyzeSentiment: AnalyzeSentimentFunction;
}


function Form({ analyzeSentiment }: FormProps) {
    const session = useSession();
    const [inputValue, setInputValue] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>();
    const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
        updateTextAreaSize(textArea);
        textAreaRef.current = textArea;
    }, [])
    

    const trpcUtils = api.useUtils();

    useLayoutEffect(() => {
        updateTextAreaSize(textAreaRef.current);
    }, [inputValue])

    const createTweet = api.tweet.create.useMutation({
        onSuccess: (newTweet) => {
            console.log(newTweet)
            setInputValue("");

            if (session.status !== "authenticated") return

            trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
                // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                if (oldData == null || oldData.pages[0] == null)  return 
                
                const newCacheTweet = {
                    ...newTweet,
                    likeCount: 0,
                    likedByMe: false,
                    user: {
                        id: session.data.user.id,
                        name: session.data.user.name,
                        image: session.data.user.image
                    }

                }

                return {
                    ...oldData,
                    pages: [
                        {
                            ...oldData.pages[0],
                            tweets: [newCacheTweet, oldData.pages[0].tweet]
                        },
                        ...oldData.pages.slice(1)
                    ]
                }
            })
        }
    });

    if(session.status !== "authenticated") return null;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
      
          const sentiment = await analyzeSentiment(inputValue);
          if (sentiment === "positive") {
            createTweet.mutate({ content: inputValue });
          } else {
            alert("Please type something positive!");
          }
      }
      

    return <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-b px-4 py-2">
        <div className="flex gap-4 ">
            <ProfileImage src = {session.data.user.image}/>
            <textarea
             ref = {inputRef}
             style = {{height: 0}}
             value = {inputValue}
             onChange= {(e) => setInputValue(e.target.value)}
             className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none" placeholder="Type something nice!"/>
        </div>
        <Button className="self-end">Tweet</Button>
    </form>
}