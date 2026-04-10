export interface ParsedProspect {
    company?: string
    contact_person?: string
    email?: string
    phone?: string
    website?: string
    company_social?: string
    decision_maker_social?: string
    revenue_listed?: boolean | string
    revenue_amount?: number | string
    sector?: string
    [key: string]: any
}

export function calculateLeadScore(lead: ParsedProspect): number {
    let score = 0

    // Has Decision Maker Name AND Social: +20
    if (lead.contact_person && lead.decision_maker_social) {
        score += 20
    }

    // Has Email AND Phone: +20
    if (lead.email && lead.phone) {
        score += 20
    }

    // Revenue Listed (Yes): +10
    const isRevenueListed = 
        lead.revenue_listed === true || 
        String(lead.revenue_listed).toLowerCase() === 'yes' || 
        String(lead.revenue_listed).toLowerCase() === 'true' ||
        (lead.revenue_amount !== undefined && lead.revenue_amount !== null && lead.revenue_amount !== '')

    if (isRevenueListed) {
        score += 10
    }

    // Revenue Amount > 500000: +20
    const revNum = Number(String(lead.revenue_amount).replace(/[^0-9.-]+/g,""))
    if (!isNaN(revNum) && revNum > 500000) {
        score += 20
    }

    // Has valid Website URL: +10
    if (lead.website || (lead.email && lead.email.includes('@'))) {
        score += 10
    }

    // Has Company Social: +5
    if (lead.company_social) {
        score += 5
    }

    // Sector exactly matches 'D2C' or 'E-commerce': +15
    if (lead.sector) {
        const sectorMatch = String(lead.sector).toLowerCase().trim()
        if (sectorMatch === 'd2c' || sectorMatch === 'e-commerce' || sectorMatch === 'ecommerce') {
            score += 15
        }
    }

    // Hard ceiling at 100 just in case logic overlaps
    return Math.min(score, 100)
}
