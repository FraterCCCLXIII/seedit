// Simple utility function for combining classes without external dependencies
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

// Utility function for conditional classes
export function conditionalClass(condition: boolean, trueClass: string, falseClass: string = '') {
  return condition ? trueClass : falseClass;
}

// Utility function for combining multiple conditional classes
export function combineClasses(...classes: (string | [boolean, string, string?])[]) {
  return classes
    .map((cls) => (Array.isArray(cls) ? conditionalClass(cls[0], cls[1], cls[2] || '') : cls))
    .filter(Boolean)
    .join(' ');
}
