exports.getStatus = (req, res) => {
    res.json({
        app: "QuickTop",
        version: "1.0.0",
        status: "Online"
    });
};