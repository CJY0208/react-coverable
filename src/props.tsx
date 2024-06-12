export default function createPropsRender<T>(coverableProps: T) {
  return {
    render: (content) => ({
      coverableProps,
      content,
    }),
  }
}
