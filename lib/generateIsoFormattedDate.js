export function generateIsoFormattedDate(normalDate) {
    if (!normalDate) {
        console.error("generateIsoFormattedDate: Date is missing or invalid.");
        return null;
    }

    // Vérifier si la date est au format "YYYY-MM-DD"
    const dateObject = new Date(normalDate + "T00:00:00Z"); 

    if (isNaN(dateObject.getTime())) {
        console.error("generateIsoFormattedDate: Invalid Date format.");
        return null;
    }

    return dateObject.toISOString();
}
