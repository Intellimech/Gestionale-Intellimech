import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

const Company = sequelize.models.Company;
const User = sequelize.models.User;
const QuotationRequest = sequelize.models.QuotationRequest;
const Category = sequelize.models.Category;

router.post("/create/", async (req, res) => {
    try {
        const { description, category, subcategory, assignment, projecttype,  technicalarea, company, name } = req.body;
        const user = req.user;  // Assuming req.user is populated by the authentication middleware

     

        // Fetch the company data
        const companyData = await Company.findOne({
            where: {
                id_company: company,
            },
        });

        if (!companyData) {
            return res.status(404).json({
                message: "Company not found",
            });
        }

       
        // Count the existing quotation requests to generate a unique name
        const countOffer = await QuotationRequest.count();

        let requestName = name;
        if (!requestName || requestName === "") {
            requestName = `RDO${new Date().getFullYear().toString().substr(-2)}_${(countOffer + 1).toString().padStart(5, "0")}`;
        }

        // Create the quotation request
        const quotationRequest = await QuotationRequest.create({
            name: requestName,
            description: description,
            technicalarea: technicalarea,
            projecttype: projecttype,
            assignment: assignment,
            company: company,
            createdBy: user.id_user,  // Use the user ID from req.user
            status: "In Attesa",
        });

        res.status(200).json({
            message: "Quotation Request created",
            quotationrequest: quotationRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;
