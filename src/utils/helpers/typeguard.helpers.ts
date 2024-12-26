/**
 * Ensure switch statement exhausts all possible cases.
 *
 * @see https://medium.com/technogise/type-safe-and-exhaustive-switch-statements-aka-pattern-matching-in-typescript-e3febd433a7a
 */
export const assertExhaustiveGuard = (
  _: never,
  message = "Reached unexpected case in exhaustive switch",
): never => {
  throw new Error(message)
}
