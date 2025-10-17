'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// Embedded CSV data - assumptions with their codes
const ASSUMPTIONS_CSV = `id,Assumptions
AO1,Water Users Association are interested in and come to the training.
AO2,Water availability and quality are sufficient despite climate variability.
AO3,Land conflicts don't prevent access to irrigated/rehabilitated parcels.
AO4,"Youth attend and complete training; training content is accessible (literacy, language, duration) and trainers deliver it effectively."
AO5,"SLARI maintains the technical capacity, and systems to consistently produce breeder/foundation seed, and distribution mechanisms function reliably so seed entities can access them on time."
AO6,"Extension agents attend and complete the training; training content is practical and accessible (literacy, language, duration); and agents are motivated and supported by MAFS to apply new skills."
AO7,"Committee members are willing to serve, attend training consistently, and community norms allow them to exercise authority over facility management."
AO8,Financial institutions actually disburse the loans before planting season; loan conditions are fair and transparent; and farmers/FBOs are willing and able to take them up.
AO9,"Insurance products are affordable and understandable for farmers. Insurers remain committed to offering them, and distribution channels reach rural areas effectively"
AO10,Social norms don't prevent women and youth to participate (no exclusion at household/community level).
OIO1.1,"Irrigation systems are operational and maintained; farmers have secure access to irrigated plots, know how to use the system effectively, and are willing to shift practices."
OIO1.2,"Farmers are willing and able to cultivate prepared land (labor/mechanization available, no disputes)"
OIO1.3,Harvesters/equipment are affordable and serviceable at peak times.
OIO1.4,"Extension and demonstrations are delivered consistently, locally relevant, and reinforce adoption decisions."
OIO1.5,"There is reliable access to spare parts, energy, and servicing for the equipment."
OIO1.6,"Farmers have reliable access to devices, connectivity, and airtime to receive information."
OIO1.7,Farmer trainings are locally relevant; incentives clear enough to trigger practice change.
OIO1.8,"Rehabilitated markets/roads/bridges are maintained and remain accessible and safe year-round, including during the rainy season."
IO1IO2.1,No extreme in-season shocks.
IO1IO2.2,Fuel/maintenance are uninterrupted at peak.
IO1IO2.3,Rainfall/irrigation timing aligns with applications of inputs.
IO1IO2.4,"Farmers adopt recommended planting practices (spacing, timing, density)."
IO1IO2.5,Moisture testing & pest control are actually applied in storage and drying floors.
IO1IO2.6,Energy is reliable for processing clusters/mills.
IO1IO2.7,Information given by AMIS/radio is credible and timely.
IO1IO2.8,Loan repayment schedules align with agricultural seasons and farmers' cash flows.
IO1IO2.9,Household/community norms allow control over assets/income for women and youth.
IO2FO1,Pest and disease outbreaks remain within the capacity of farmers and extension services to control.
IO2FO2,"Seed, fertilizer, and input supply chains remain functional, timely, and affordable."
IO2FO3,"Credit and insurance products continue to be offered reliably across agricultural seasons, with terms that farmers can access and trust."
IO2FO4,"Procurement processes and targeting criteria actively include women and youth, without exclusion at household or community level."
FOI1,Government and large buyers prioritize local crops over imports.
FOI2,Logistics systems (transport and storage) function at scale to move local crops efficiently.
FOI3,"Food supply keeps pace with population and income growth, keeping staple prices affordable."`;

const CONNECTIONS_CSV = `Source_id,target_id,connection_type,Assumptions_id
N1,N12,leads to,AO1
N2,N13,leads to,
N3,N13,leads to,
N4,N13,leads to,
N5,N13,leads to,
N6,N13,leads to,AO2
N7,N14,leads to,AO3
N8,N15,leads to,AO4
N9,N16,leads to,
N10,N17,leads to,AO4
N11,N18,leads to,
N12,N19,leads to,
N13,N19,leads to,OIO1.1
N14,N19,leads to,
N15,N19,leads to,
N16,N19,leads to,OIO1.2
N17,N20,leads to,
N18,N21,leads to,OIO1.3
N19,N22,leads to,
N19,N23,leads to,
N19,N24,leads to,IO1IO2.1
N20,N25,leads to,
N20,N26,leads to,
N21,N27,leads to,
N21,N28,leads to,IO1IO2.2
N22,N64,leads to,IO2FO1
N23,N64,leads to,IO2FO1
N24,N64,leads to,IO2FO1
N25,N65,leads to,
N26,N65,leads to,
N27,N65,leads to,
N28,N65,leads to,
N29,N44,leads to,
N30,N45,leads to,
N31,N45,leads to,
N32,N45,leads to,
N33,N46,leads to,
N34,N47,leads to,AO5
N35,N48,leads to,
N36,N49,leads to,
N37,N45,leads to,
N38,N45,leads to,
N38,N44,leads to,
N39,N50,leads to,
N40,N51,leads to,
N41,N52,leads to,
N42,N53,leads to,
N43,N54,leads to,
N44,N55,leads to,
N45,N55,leads to,OIO1.4
N46,N56,leads to,OIO1.5
N47,N56,leads to,
N48,N56,leads to,
N48,N55,leads to,
N49,N56,leads to,
N50,N55,leads to,
N50,N84,leads to,
N51,N57,leads to,
N52,N57,leads to,
N53,N57,leads to,
N54,N57,leads to,
N55,N58,leads to,IO1IO2.3
N55,N59,leads to,IO1IO2.4
N55,N60,leads to,
N56,N61,leads to,
N57,N62,leads to,
N57,N63,leads to,
N58,N65,leads to,
N59,N64,leads to,
N60,N64,leads to,
N61,N64,leads to,
N62,N64,leads to,
N63,N64,leads to,
N64,N210,leads to,
N64,N212,leads to,
N64,N214,leads to,"FOI1, FOI2"
N65,N210,leads to,
N65,N211,leads to,
N65,N212,leads to,FOI3
N65,N213,leads to,
N66,N74,leads to,
N67,N75,leads to,
N68,N76,leads to,
N69,N77,leads to,
N70,N78,leads to,
N71,N79,leads to,AO6
N72,N80,leads to,
N73,N81,leads to,
N74,N82,leads to,OIO1.6
N75,N82,leads to,
N76,N83,leads to,
N77,N84,leads to,
N78,N85,leads to,OIO1.6
N79,N85,leads to,
N80,N86,leads to,OIO1.7
N81,N82,leads to,
N82,N88,leads to,
N82,N89,leads to,
N83,N22,leads to,
N83,N90,leads to,
N84,N92,leads to,
N84,N93,leads to,
N85,N94,leads to,
N86,N23,leads to,
N86,N58,leads to,
N86,N60,leads to,
N86,N90,leads to,
N86,N94,leads to,
N88,N95,leads to,
N89,N95,leads to,
N90,N65,leads to,
N92,N96,leads to,
N93,N96,leads to,
N94,N65,leads to,
N95,N211,leads to,
N95,N212,leads to,
N96,N213,leads to,
N96,N212,leads to,
N96,N214,leads to,
N97,N112,leads to,
N98,N113,leads to,
N99,N113,leads to,
N100,N113,leads to,
N101,N114,leads to,
N102,N115,leads to,
N103,N116,leads to,AO7
N104,N117,leads to,
N105,N118,leads to,
N106,N119,leads to,
N107,N120,leads to,
N108,N121,leads to,
N109,N122,leads to,
N110,N123,leads to,
N111,N124,leads to,
N112,N125,leads to,
N113,N125,leads to,
N114,N126,leads to,
N115,N126,leads to,
N116,N126,leads to,
N117,N127,leads to,
N118,N128,leads to,
N119,N128,leads to,OIO1.8
N120,N128,leads to,
N121,N129,leads to,OIO1.6
N122,N130,leads to,
N123,N130,leads to,
N124,N131,leads to,
N125,N132,leads to,IO1IO2.5
N125,N133,leads to,
N126,N134,leads to,
N126,N135,leads to,IO1IO2.6
N127,N136,leads to,
N128,N137,leads to,
N128,N138,leads to,
N129,N139,leads to,IO1IO2.7
N129,N140,leads to,
N130,N141,leads to,
N130,N142,leads to,
N131,N143,leads to,
N131,N144,leads to,
N131,N135,leads to,
N132,N64,leads to,
N133,N64,leads to,
N134,N65,leads to,
N135,N65,leads to,
N136,N96,leads to,
N137,N96,leads to,
N138,N96,leads to,
N139,N96,leads to,
N140,N96,leads to,
N141,N96,leads to,
N142,N96,leads to,
N143,N96,leads to,
N144,N96,leads to,
N145,N155,leads to,AO8
N146,N156,leads to,
N147,N157,leads to,
N148,N158,leads to,
N149,N159,leads to,
N150,N160,leads to,
N151,N161,leads to,
N152,N162,leads to,
N153,N163,leads to,AO9
N154,N164,leads to,AO9
N155,N165,leads to,
N156,N166,leads to,
N157,N166,leads to,
N158,N167,leads to,
N159,N168,leads to,
N160,N169,leads to,
N161,N170,leads to,
N162,N166,leads to,
N163,N171,leads to,
N164,N171,leads to,
N165,N19,contributes to,
N165,N20,contributes to,
N165,N21,contributes to,
N165,N55,contributes to,
N165,N125,contributes to,
N165,N126,contributes to,
N165,N172,leads to,IO1IO2.8
N166,N173,leads to,
N167,N174,leads to,
N168,N175,leads to,
N169,N173,leads to,
N170,N172,leads to,
N171,N176,leads to,
N172,N64,leads to,
N172,N65,leads to,IO2FO2
N173,N177,leads to,
N174,N96,leads to,
N175,N177,leads to,
N176,N95,leads to,IO2FO3
N177,N210,leads to,
N177,N211,leads to,
N177,N214,leads to,
N178,N188,leads to,AO10
N179,N189,leads to,
N180,N190,leads to,
N181,N191,leads to,
N182,N192,leads to,
N183,N193,leads to,
N184,N194,leads to,
N185,N195,leads to,
N186,N196,leads to,
N187,N197,leads to,
N188,N198,leads to,
N189,N200,leads to,
N190,N199,leads to,
N191,N198,leads to,
N192,N200,leads to,
N193,N200,leads to,
N194,N200,leads to,
N195,N201,leads to,
N196,N202,leads to,
N197,N200,leads to,
N198,N204,leads to,
N199,N205,leads to,IO1IO2.9
N200,N206,leads to,
N200,N207,leads to,
N201,N208,leads to,
N202,N26,leads to,
N202,N206,leads to,
N204,N209,leads to,IO2FO4
N205,N209,leads to,IO2FO4
N206,N209,leads to,IO2FO4
N206,N65,leads to,IO2FO4
N207,N209,leads to,IO2FO4
N208,N209,leads to,
N209,N213,leads to,
N209,N212,leads to,
N209,N214,leads to,`;

function parseCsvLine(line) {
  const result = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  result.push(field);
  return result.map(s => s.trim());
}

exports.up = async function(db) {
  await db.runSql('BEGIN');
  try {
    // Find the Feed Salone Full board
    const boardRes = await db.runSql(
      `SELECT id FROM boards WHERE title = $1 LIMIT 1`,
      ['Feed Salone Theory of Change - Full']
    );
    
    if (boardRes.rows.length === 0) {
      throw new Error('Feed Salone Theory of Change - Full board not found');
    }
    
    const boardId = boardRes.rows[0].id;

    // Find super admin user
    const superAdminRes = await db.runSql(
      `SELECT id FROM users WHERE role = 'super_admin' LIMIT 1`
    );
    
    if (superAdminRes.rows.length === 0) {
      throw new Error('Super admin user not found');
    }
    
    const superAdminId = superAdminRes.rows[0].id;

    // Parse assumptions CSV
    const assumptionsLines = ASSUMPTIONS_CSV.split(/\r?\n/).filter(Boolean);
    const assumptions = assumptionsLines
      .filter(l => !l.toLowerCase().startsWith('id,'))
      .map(parseCsvLine)
      .map(cols => ({
        code: cols[0],
        content: cols[1]
      }))
      .filter(a => a.code && a.content);

    console.log(`Parsed ${assumptions.length} assumptions from CSV`);

    // Parse connections CSV
    const connectionsLines = CONNECTIONS_CSV.split(/\r?\n/).filter(Boolean);
    const connections = connectionsLines
      .filter(l => !l.toLowerCase().startsWith('source_id'))
      .map(parseCsvLine)
      .map(cols => ({
        source: cols[0],
        target: cols[1],
        type: (cols[2] || '').trim(),
        assumptionCodes: (cols[3] || '').trim()
      }))
      .filter(c => c.source && c.target);

    console.log(`Parsed ${connections.length} connections from CSV`);

    // Get all edges for this board, ordered by their creation (should match CSV order)
    const edgesRes = await db.runSql(`
      SELECT be.id, be.source_node_id, be.target_node_id, be.created_at
      FROM board_edges be
      WHERE EXISTS (
        SELECT 1 FROM board_lists bl
        WHERE bl.board_id = $1
        AND be.source_node_id = ANY(
          CASE 
            WHEN jsonb_typeof(bl.node_ids) = 'array' 
            THEN ARRAY(SELECT jsonb_array_elements_text(bl.node_ids)::integer)
            ELSE ARRAY[]::integer[]
          END
        )
      )
      ORDER BY be.id ASC
    `, [boardId]);

    console.log(`Found ${edgesRes.rows.length} edges for this board`);

    // Match edges by their order (CSV order matches insertion order from the migration)
    let linkedCount = 0;
    let assumptionCount = 0;

    for (let i = 0; i < connections.length && i < edgesRes.rows.length; i++) {
      const conn = connections[i];
      const edge = edgesRes.rows[i];
      
      if (!conn.assumptionCodes) continue;

      // Parse assumption codes (can be comma-separated or pipe-separated)
      const codes = conn.assumptionCodes
        .split(/[,|]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (codes.length === 0) continue;

      for (const code of codes) {
        // Find the assumption content
        const assumption = assumptions.find(a => a.code === code);
        if (!assumption) {
          console.log(`Warning: Assumption code ${code} not found in assumptions CSV`);
          continue;
        }

        // Insert assumption into board_edge_assumptions table
        try {
          await db.runSql(
            `INSERT INTO board_edge_assumptions (edge_id, user_id, content, strength)
             VALUES ($1, $2, $3, $4)`,
            [edge.id, superAdminId, assumption.content, 'medium']
          );
          assumptionCount++;
          linkedCount++;
        } catch (err) {
          console.log(`Warning: Could not insert assumption for edge ${edge.id}: ${err.message}`);
        }
      }
    }

    console.log(`Created ${assumptionCount} assumption records linked to ${linkedCount} edges`);

    await db.runSql('COMMIT');
  } catch (err) {
    await db.runSql('ROLLBACK');
    throw err;
  }
};

exports.down = async function(db) {
  await db.runSql('BEGIN');
  try {
    const boardRes = await db.runSql(
      `SELECT id FROM boards WHERE title = $1 LIMIT 1`,
      ['Feed Salone Theory of Change - Full']
    );
    
    if (boardRes.rows.length > 0) {
      const boardId = boardRes.rows[0].id;
      
      // Delete all assumptions for edges in this board
      await db.runSql(`
        DELETE FROM board_edge_assumptions
        WHERE edge_id IN (
          SELECT be.id FROM board_edges be
          WHERE EXISTS (
            SELECT 1 FROM board_lists bl
            WHERE bl.board_id = $1
            AND be.source_node_id = ANY(
              CASE 
                WHEN jsonb_typeof(bl.node_ids) = 'array' 
                THEN ARRAY(SELECT jsonb_array_elements_text(bl.node_ids)::integer)
                ELSE ARRAY[]::integer[]
              END
            )
          )
        )
      `, [boardId]);
      
      console.log('Deleted assumptions for Feed Salone board edges');
    }

    await db.runSql('COMMIT');
  } catch (err) {
    await db.runSql('ROLLBACK');
    throw err;
  }
};

exports._meta = {
  version: 1
};

