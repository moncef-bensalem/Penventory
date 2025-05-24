/**
 * Recursively converts BigInt values to strings in an object or array
 * @param {any} data - The data to serialize
 * @returns {any} - The serialized data with BigInt converted to strings
 */
export function serializeBigInt(data) {
  // Handle null or undefined
  if (data == null) {
    return data;
  }

  // Handle BigInt
  if (typeof data === 'bigint') {
    return data.toString();
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeBigInt(item));
  }

  // Handle objects (but not Date or other special objects)
  if (typeof data === 'object' && data.constructor === Object) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }

  // Return primitive values as is
  return data;
}
