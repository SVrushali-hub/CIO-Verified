import db from "../config/db.js";

function getRiskLevel(percentage) {
  if (percentage >= 80) return "LOW";
  if (percentage >= 60) return "MEDIUM";
  return "HIGH";
}

function getCertificationDecision({ percentage, criticalFailure, pillarRuleFailure }) {
  if (criticalFailure || pillarRuleFailure) {
    return {
      certification_status: "NOT_CERTIFIED",
      certification_band: "Rejected - Critical Failure",
      outcome_label: "Assessment Completed – Not Certified",
      certificate_eligible: false,
    };
  }

  if (percentage >= 85) {
    return {
      certification_status: "CERTIFIED",
      certification_band: "CIO Verified Gold",
      outcome_label: "Certified",
      certificate_eligible: true,
    };
  }

  if (percentage >= 75) {
    return {
      certification_status: "CERTIFIED",
      certification_band: "CIO Verified Certified",
      outcome_label: "Certified",
      certificate_eligible: true,
    };
  }

  if (percentage >= 65) {
    return {
      certification_status: "WITHHELD",
      certification_band: "Conditionally Verified",
      outcome_label: "Improvement Advisory Required",
      certificate_eligible: false,
    };
  }

  return {
    certification_status: "NOT_CERTIFIED",
    certification_band: "Assessment Completed – Not Certified",
    outcome_label: "Assessment Completed – Not Certified",
    certificate_eligible: false,
  };
}

export const calculateChecklistScores = async (checklistId, existingConn = null) => {
  const conn = existingConn || await db.getConnection();
  const ownConn = !existingConn;

  try {
    const [items] = await conn.query(
      `SELECT * FROM checklist_response_items WHERE checklist_id = ?`,
      [checklistId]
    );

    if (!items.length) {
      throw new Error("No checklist items found");
    }

    const applicableItems = items.filter((item) => item.status !== "not_applicable");

    const totalScore = applicableItems.reduce(
      (sum, item) => sum + Number(item.awarded_score || 0),
      0
    );

    const maxScore = applicableItems.reduce(
      (sum, item) => sum + Number(item.max_score || 0),
      0
    );

    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const trustIndex = percentageScore / 10;

    const criticalFailure = applicableItems.some(
      (item) =>
        Boolean(item.critical_item) &&
        Number(item.awarded_score || 0) < Number(item.min_required_score || 0)
    );

    const pillarMap = new Map();

    for (const item of applicableItems) {
      const key = `${item.pillar_code}__${item.pillar_name}`;

      if (!pillarMap.has(key)) {
        pillarMap.set(key, {
          pillar_code: item.pillar_code,
          pillar_name: item.pillar_name,
          awarded_score: 0,
          max_score: 0,
          minimum_required_score: 0,
        });
      }

      const pillar = pillarMap.get(key);
      pillar.awarded_score += Number(item.awarded_score || 0);
      pillar.max_score += Number(item.max_score || 0);
      pillar.minimum_required_score += Number(item.min_required_score || 0);
    }

    await conn.query(
      `DELETE FROM assessment_pillar_scores WHERE checklist_id = ?`,
      [checklistId]
    );

    let pillarRuleFailure = false;

    for (const [, pillar] of pillarMap) {
      const pct =
        pillar.max_score > 0 ? (pillar.awarded_score / pillar.max_score) * 100 : 0;

      const meetsMinimumRule =
        pillar.awarded_score >= pillar.minimum_required_score;

      if (!meetsMinimumRule) {
        pillarRuleFailure = true;
      }

      await conn.query(
        `INSERT INTO assessment_pillar_scores (
          checklist_id,
          pillar_code,
          pillar_name,
          awarded_score,
          max_score,
          percentage_score,
          minimum_required_score,
          meets_minimum_rule,
          risk_level,
          summary_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          checklistId,
          pillar.pillar_code,
          pillar.pillar_name,
          pillar.awarded_score,
          pillar.max_score,
          pct,
          pillar.minimum_required_score,
          meetsMinimumRule,
          getRiskLevel(pct),
          meetsMinimumRule ? "Pillar minimum met" : "Pillar minimum not met",
        ]
      );
    }

    const decision = getCertificationDecision({
      percentage: percentageScore,
      criticalFailure,
      pillarRuleFailure,
    });

    const issueDate =
      decision.certificate_eligible ? new Date() : null;

    const validTill =
      decision.certificate_eligible
        ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        : null;

    await conn.query(
      `UPDATE assessment_checklists
       SET total_score = ?,
           max_score = ?,
           percentage_score = ?,
           trust_index = ?,
           critical_failure = ?,
           pillar_rule_failure = ?,
           certification_status = ?,
           certification_band = ?,
           outcome_label = ?,
           certificate_eligible = ?,
           issued_on = ?,
           valid_till = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        totalScore,
        maxScore,
        percentageScore,
        trustIndex,
        criticalFailure,
        pillarRuleFailure,
        decision.certification_status,
        decision.certification_band,
        decision.outcome_label,
        decision.certificate_eligible,
        issueDate ? issueDate.toISOString().slice(0, 10) : null,
        validTill ? validTill.toISOString().slice(0, 10) : null,
        checklistId,
      ]
    );

    return {
      checklistId,
      totalScore,
      maxScore,
      percentageScore,
      trustIndex,
      criticalFailure,
      pillarRuleFailure,
      ...decision,
      issued_on: issueDate ? issueDate.toISOString().slice(0, 10) : null,
      valid_till: validTill ? validTill.toISOString().slice(0, 10) : null,
    };
  } finally {
    if (ownConn) conn.release();
  }
};