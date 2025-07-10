const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  const { planId } = req.query;
  if (!planId) return res.status(400).json({ error: "Missing planId" });

  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

  const filter = encodeURIComponent(`{TinyID} = '${planId}'`);
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${filter}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log("Fetched from Airtable:", data);

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const record = data.records[0].fields;

    res.status(200).json({
      planText: record["GPT Output"] || "(no plan text)",
      userSummary: record["User Input Summary"] || "",
      riskLink: record["Risk Mapper Link"] || "",
      email: record["Email (optional)"] || "",
      skills: record["Skills"] || "",
      capital: record["Capital"] || "",
      confidence: record["Confidence"] || "",
      helpArea: record["Help Area"] || "",
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
