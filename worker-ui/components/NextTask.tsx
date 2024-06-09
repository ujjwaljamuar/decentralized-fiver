"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/utils/config";
import Image from "next/image";

interface Task {
    id: string;
    amount: number;
    title: string;
    options: {
        id: string;
        image_url: string;
        task_id: string;
    }[];
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNzkyMzg4M30.YLIjjbPfvSBxe_mb2P4nw_gmGCRNBtjZs2cBoeFigPA
const Nexttask = () => {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${BACKEND_URL}/v1/worker/nexttask`, {
                headers: {
                    // Authorization: localStorage.getItem("token"),
                    Authorization:
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNzkyMzg4M30.YLIjjbPfvSBxe_mb2P4nw_gmGCRNBtjZs2cBoeFigPA",
                },
            })
            .then((res) => {
                setCurrentTask(res.data.task);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentTask) {
        return (
            <div>
                There are no pending task at the moment, Please check again
                after some time.
            </div>
        );
    }
    return (
        <div>
            <div className="text-2xl pt-20 flex justify-center">
                {currentTask.title}
            </div>

            <div className="flex justify-center pt-8">
                {currentTask.options.map((option) => (
                    <Option
                        key={option.id}
                        onSelect={async () => {
                            const response = await axios.post(
                                `${BACKEND_URL}/v1/worker/submission`,
                                {
                                    taskId: currentTask.id,
                                    selection: option.id,
                                },
                                {
                                    headers: {
                                        // Authorization: localStorage.getItem("token"),
                                        Authorization:
                                            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNzkyMzg4M30.YLIjjbPfvSBxe_mb2P4nw_gmGCRNBtjZs2cBoeFigPA",
                                    },
                                }
                            );

                            const nextTask = response.data.next
                        }}
                        id={option.id}
                        imageUrl={option.image_url}
                    />
                ))}
            </div>
        </div>
    );
};

function Option({
    imageUrl,
    id,
}: {
    imageUrl: string;
    id: string;
    onSelect: () => void;
}) {
    return (
        <div>
            <Image
                className={"p-2 w-96 rounded-md"}
                onClick={onselect}
                src={imageUrl}
                alt="imageUrl"
            />
        </div>
    );
}

export default Nexttask;
