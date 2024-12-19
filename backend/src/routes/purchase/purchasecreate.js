import express from "express";
import sequelize from "../../utils/db.js";

// Setup the express router
const router = express.Router();

const Purchase = sequelize.models.Purchase;
const PurchaseRow = sequelize.models.PurchaseRow;
router.post("/create", async (req, res) => {
  try {

    const { id_company, products, date, payment, currency, referent, today, banktransfer , job} = req.body;
let data= date;
    const user = req.user; // Assuming req.user is populated by the authentication middleware
// Creiamo un array che raccoglie i campi mancanti
let missingFields = [];
if (!id_company) missingFields.push("Fornitore");
if (!products) missingFields.push("Prodotti");
if (!date) missingFields.push("Data");
if (!payment) missingFields.push("Pagamento");
if (!currency) missingFields.push("Valuta");
if (!referent) missingFields.push("Referente");

// Controllo per il campo `payment` e se `banktransfer` è necessario
if (payment === 1 && !banktransfer) {
  missingFields.push("Dettagli di pagamento");
}

// Se ci sono campi mancanti, restituiamo l'errore con i campi mancanti
if (missingFields.length > 0) {
  return res.status(400).json({
    message: "Campi mancanti: " + missingFields.join(", "),
  });
}


if (today){
 
  data = new Date();
}





    // Count distinct purchases to generate a unique name
    const purchaseCount = await Purchase.count({ distinct: "name" });

    // Generate a unique purchase name
    let namePurchase = `ODA${new Date().getFullYear().toString().substr(-2)}_${(purchaseCount + 1).toString().padStart(5, "0")}_R0`;

    // Sum all the prices of the products
    products.forEach((product) => {
      product.total = product.unit_price * product.quantity;
      product.taxed_totalprice = product.taxed_unit_price * product.quantity;
    });

    // Calculate the total price of the purchase
    const purchaseTotal = products.reduce((acc, product) => acc + product.total, 0);
    
    // Calculate the total price of the purchase
    const purchaseTotaltax = products.reduce((acc, product) => acc + product.taxed_totalprice, 0);

    // Create the purchase entry
    const purchase = await Purchase.create({
      id_company: id_company,
      name: namePurchase,
      payment_method: payment,
      banktransfer: banktransfer,
      date: data,
      currency: currency,
      total: purchaseTotal,
      taxed_total: purchaseTotaltax,
      referent: referent,
      job: job,
      createdBy: user.id_user, // Use user ID from req.user
    });

    const purchaseId = purchase.id_purchase;

    // Create the associated purchase rows
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      let increment = (i + 1) * 10; // Calcolo del numero incrementale

      // Dividere il nome originale nelle sue parti
      let parts = namePurchase.split("_"); // ["ODA24", "00015", "R1"]

      // Ricomporre il nome con il nuovo numero nella posizione desiderata
      let PurchaseRowName = `${parts[0]}_${parts[1]}_${increment}_${parts[2]}`;

      console.log(PurchaseRowName); // Output: ODA24_00015_10_R1

      // Validate depreciation_years if depreciation is true
      if (product.depreciation && (!product.depreciation_years || product.depreciation_years <= 0)) {
        return res.status(400).json({
          message: "Depreciation years must be a positive number when depreciation is enabled",
        });
      }

      console.log(product);
       // Validazione del campo subsubcategory
  if (!product.subsubcategory || isNaN(product.subsubcategory)) {
    product.subsubcategory = null; // Usa `null` per evitare l'errore
  }


      await PurchaseRow.create({
        id_purchase: purchaseId,
        name: PurchaseRowName,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory || null,
        unit_price: product.taxed_unit_price,
        taxed_unit_price: product.unit_price,
        quantity: product.quantity,
        vat: parseFloat(product.vat) || 0,
        totalprice: product.taxed_totalprice,
        taxed_totalprice: product.total,
        depreciation: product.depreciation || false,
        depreciation_years: product.depreciation ? product.depreciation_years : null,
        depreciation_details: product.depreciation ? product.depreciation_details : null,
        depreciation_aliquota: product.depreciation ? product.depreciation_aliquota : null,
        asset: product.asset || false,
      });
    }
    // Recupera il purchase con il conteggio delle righe
    const createdPurchase = await Purchase.findByPk(purchaseId, {
      include: [{ model: PurchaseRow, as: "PurchaseRows" }],
    });

    res.status(201).json({
      message: "Purchase created",
      purchase: createdPurchase,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});
export default router;
