export function generateCouponCode(title, expireDate) {
    // Convert title to uppercase and remove spaces
    let formattedTitle = title.toUpperCase().replace(/\s+/g, '');
    
    // Format the date to match DDMMYYYY
    let formattedExpireDate = expireDate.split('-').reverse().join('')
    
    // Generate the coupon code
    let couponCode = `${formattedTitle}-${formattedExpireDate}`;
    
    return couponCode;
}