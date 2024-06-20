"use client";
import { Appbar } from "@/components/Appbar";
import { BACKEND_URL } from "@/utils/configs";
import axios from "axios";
import { useEffect, useState } from "react";

async function getTaskDetails(taskId: string) {
    const response = await axios.get(
        `${BACKEND_URL}/v1/user/task?taskId=${taskId}`,
        {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        }
    );
    return response.data;
}

export default function Page({
    params: { taskId },
}: {
    params: { taskId: string };
}) {
    const [result, setResult] = useState<
        Record<
            string,
            {
                count: number;
                option: {
                    imageUrl: string;
                };
            }
        >
    >({});
    const [taskDetails, setTaskDetails] = useState<{
        title?: string;
    }>({});

    useEffect(() => {
        getTaskDetails(taskId).then((data) => {
            setResult(data.result);
            setTaskDetails(data.taskDetails);
        });
    }, [taskId]);

    return (
        <div>
            <Appbar />
            <div className="text-2xl pt-20 flex justify-center">
                {taskDetails.title}
            </div>
            <div className="flex justify-center pt-8">
                {Object.keys(result || {}).map((taskId) => (
                    <Task
                        key={taskId}
                        imageUrl={result[taskId].option.imageUrl}
                        votes={result[taskId].count}
                    />
                ))}
            </div>
        </div>
    );
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
    return (
        <div>
            <img className={"p-2 w-96 rounded-md"} src={imageUrl} />
            <div className="flex justify-center">{votes}</div>
        </div>
    );
}

// "use client";
// import { Appbar } from "@/components/Appbar";
// import { BACKEND_URL } from "@/utils/configs";
// import axios from "axios";
// import { useEffect, useState } from "react";

// async function getTaskDetails(taskId: string) {
//     const response = await axios.get(
//         `${BACKEND_URL}/v1/user/task?taskId=${taskId}`,
//         {
//             headers: {
//                 Authorization: localStorage.getItem("token"),
//                 // Authorization:
//                 //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNzQwNzUwMX0.izIHlBSFld87aqLmwDfQZL3FTtn1SzifjEYTilf9aU4",
//             },
//         }
//     );

//     return response.data;
// }

// export default function Page({
//     params: { taskId },
// }: {
//     params: { taskId: string };
// }) {
//     const [result, setResult] = useState<
//         Record<
//             string,
//             {
//                 count: number;
//                 option: {
//                     imageUrl: string;
//                 };
//             }
//         >
//     >({});
//     const [taskDetails, setTaskDetails] = useState<{
//         title?: string;
//     }>({});

//     useEffect(() => {
//         getTaskDetails(taskId).then((data) => {
//             setResult(data.results);
//             setTaskDetails(data.taskDetails);
//         });
//         setInterval(() => {
//             getTaskDetails(taskId).then((data) => {
//                 setResult(data.results);
//                 setTaskDetails(data.taskDetails);
//             });
//         }, 5000);
//     }, [taskId]);

//     return (
//         <div>
//             <Appbar />
//             <div className="text-2xl pt-20 flex justify-center">
//                 {taskDetails.title}
//             </div>
//             <div className="flex justify-center pt-8">
//                 {Object.keys(result || {}).map((taskId) => (
//                     <Task
//                         key={taskId}
//                         imageUrl={result[taskId].option.imageUrl}
//                         votes={result[taskId].count}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// }

// function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
//     return (
//         <div>
//             <img className={"p-2 w-96 rounded-md"} src={imageUrl} />
//             <div className="flex justify-center">{votes}</div>
//         </div>
//     );
// }
