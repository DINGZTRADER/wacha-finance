export default async function handler(req: any, res: any) {
    try {
        const { default: app } = await import("../server/dist/index.js");
        return app(req, res);
    } catch (err: any) {
        res.status(500).json({
            error: "Vercel serverless load failure",
            message: err.message,
            stack: err.stack
        });
    }
}
