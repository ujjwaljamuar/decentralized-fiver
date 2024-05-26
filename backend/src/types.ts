import z from "zod";

export const createTaskInput = z.object({
    options: z.array(
        z.object({
            imageUrl: z.string(),
        })
    ),

    title: z.string().optional(),
    signature: z.string(),
});

export type getTaskResult = Record<
    string,
    {
        count: number;
        option: {
            imageUrl: string;
        };
    }
>;