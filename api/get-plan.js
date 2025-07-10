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

    const text = await response.text(); // optional: debug raw response
    console.log("Raw Airtable response:", text);

    const data = JSON.parse(text);

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const record = data.records[0].fields;
    
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      planText: record["GPTOutput"] || "(no plan text)",
      userSummary: record["UserInputSummary"] || "",
      riskLink: record["RiskMapperLink"] || "",
      email: record["Email"] || "",
      skills: record["Skills"] || "",
      capital: record["Capital"] || "",
      confidence: record["Confidence"] || "",
      helpArea: record["HelpArea"] || "",
      tinyID: record["TinyID"] || "",
    });
    
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
