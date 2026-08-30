import User from "../models/user.model.js";
import Component from "../models/component.model.js";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export const saveComponent = async (req, res) => {
    try {
        const {
            name,
            code,
            props,
            visibility = "private",
        } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Component name is required",
            });
        }

        if (!code || typeof code !== "string" || !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Component code is required",
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User is not found",
            });
        }

        const componentName = name.trim();

        const componentVisibility =
            visibility === "public" && user.role === "admin"
                ? "public"
                : "private";

        let component = await Component.findOne({
            owner: user._id,
            code: code.trim(),
            name: componentName
        });

        if (!component) {
            component = await Component.create({
                name: componentName,
                code: code.trim(),
                props: Array.isArray(props) ? props : [],
                owner: user._id,
                visibility: componentVisibility,
                npmPackage: "",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Component saved successfully",
            component,
        });

    } catch (error) {
        console.error("Save Component Error:", error);

        return res.status(500).json({
            success: false,
            message: error?.message || "Failed to save component",
        });
    }
};


export const publishComponent = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User is not found",
            });
        }

        const componentId =
            req.params.id ||
            req.body.componentId ||
            req.body.id;

        if (!componentId) {
            return res.status(400).json({
                success: false,
                message: "Component ID is required",
            });
        }

        const component = await Component.findById(componentId);

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Component not found",
            });
        }

        if (
            component.owner &&
            component.owner.toString() !== user._id.toString() &&
            user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only publish your own components",
            });
        }

        let libPath = path.resolve(process.cwd(), "../lib");

        if (!fs.existsSync(libPath)) {
            libPath = path.resolve(process.cwd(), "lib");
        }

        let packageJson = null;

        if (fs.existsSync(libPath)) {
            const componentDir = path.join(
                libPath,
                "src",
                "components",
                component.name
            );

            const componentFile = path.join(
                componentDir,
                `${component.name}.jsx`
            );

            const indexFile = path.join(
                libPath,
                "src",
                "index.js"
            );

            if (!fs.existsSync(componentDir)) {
                fs.mkdirSync(componentDir, {
                    recursive: true,
                });
            }

            fs.writeFileSync(
                componentFile,
                component.code,
                "utf8"
            );

            if (!fs.existsSync(indexFile)) {
                fs.writeFileSync(
                    indexFile,
                    "",
                    "utf8"
                );
            }

            let indexContent = fs.readFileSync(
                indexFile,
                "utf8"
            );

            const exportLine =
                `export { ${component.name} } from "./components/${component.name}/${component.name}.jsx";`;

            if (!indexContent.includes(exportLine)) {
                if (
                    indexContent.length > 0 &&
                    !indexContent.endsWith("\n")
                ) {
                    indexContent += "\n";
                }

                indexContent += `${exportLine}\n`;

                fs.writeFileSync(
                    indexFile,
                    indexContent,
                    "utf8"
                );
            }

            const packageJsonPath = path.join(
                libPath,
                "package.json"
            );

            if (fs.existsSync(packageJsonPath)) {
                try {
                    packageJson = JSON.parse(
                        fs.readFileSync(
                            packageJsonPath,
                            "utf8"
                        )
                    );
                } catch (e) {
                    console.log(
                        "Package JSON Error:",
                        e.message
                    );
                }
            }

            try {
                execSync("npm run build", {
                    cwd: libPath,
                    stdio: "ignore",
                });
            } catch (buildErr) {
                console.log(
                    "Lib build note (continuing):",
                    buildErr.message
                );
            }
        }

        component.visibility = "public";

        if (packageJson?.name) {
            component.npmPackage = packageJson.name;
        }

        await component.save();

        return res.status(200).json({
            success: true,
            message: "Component published successfully",
            component,
            npmPackage: packageJson?.name || "zyven-ui",
            version: packageJson?.version || "1.0.0",
        });

    } catch (error) {
        console.error(
            "Publish Component Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Failed to publish component",
        });
    }
};


export const getAllComponents = async (req, res) => {
    try {
        let userId = null;
        const { token } = req.cookies;
        if (token) {
            try {
                // Dynamically import jwt if not already imported at top
                const jwt = (await import("jsonwebtoken")).default;
                const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
                if (verifyToken && verifyToken.userId) {
                    userId = verifyToken.userId;
                }
            } catch (e) {
                // Invalid or expired token is ignored for public component access
            }
        }

        const query = {
            $or: [
                { visibility: "public" }
            ]
        };

        if (userId) {
            query.$or.push({ owner: userId });
        }

        const components = await Component.find(query)
            .populate("owner", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            components,
        });

    } catch (error) {
        console.error(
            "GET ALL COMPONENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Failed to get all components",
        });
    }
};
export const getMyComponents = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const components = await Component.find({ owner: user._id })
            .populate("owner", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            components,
        });
    } catch (error) {
        console.error("GET MY COMPONENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error?.message || "Failed to get my components",
        });
    }
};
