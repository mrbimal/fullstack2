// Mock API helpers
export const mockFetchPosts = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'p1', title: 'Hello World', content: 'This is a post', updatedAt: Date.now() - 1000 * 60 * 60 },
        { id: 'p2', title: 'Second Post', content: 'Another post content', updatedAt: Date.now() - 1000 * 60 * 30 },
      ])
    }, 400)
  })

export const mockFetchPlatforms = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 'web', name: 'Web' },
        { id: 'mobile', name: 'Mobile' },
        { id: 'instagram', name: 'Instagram' },
        { id: 'x', name: 'X' },
        { id: 'snapchat', name: 'Snapchat' },
      ])
    }, 200)
  })
