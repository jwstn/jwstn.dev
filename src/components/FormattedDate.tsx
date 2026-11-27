const formatter = new Intl.DateTimeFormat("en-us", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function FormattedDate({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()}>{formatter.format(date)}</time>;
}
