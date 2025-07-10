export default async function handler(req, res) {
  const { planId } = req.query;
  if (!planId) return res.status(400).json({ error: "Missing planId" });

  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={TinyID}='${planId}'`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  const data = await response.json();

  if (!data.records?.length) return res.status(404).json({ error: "Plan not found" });

  const record = data.records[0].fields;

  res.status(200).json({
    planText: record["GPT Output"],
    userSummary: record["User Input Summary"],
    riskLink: record["Risk Mapper Link"],
    email: record["Email (optional)"],
    skills: record["Skills"],
    capital: record["Capital"],
    confidence: record["Confidence"],
    helpArea: record["Help Area"],
  });
}
