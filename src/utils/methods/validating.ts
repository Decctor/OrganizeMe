function isEmpty(value: string | number | null) {
  return (
    value == null || (typeof value === "string" && value.trim().length === 0)
  );
}
