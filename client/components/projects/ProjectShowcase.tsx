export function ProjectShowcase() {
  return (
    <section>
      <h2 className='text-xl font-bold mb-2'>Projects</h2>
      {/* TODO: Render project cards from data */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Example project card */}
        <div className='bg-white dark:bg-gray-900 rounded shadow p-4'>
          <h3 className='font-semibold'>Sample Project</h3>
          <p>Description of the project.</p>
        </div>
      </div>
    </section>
  )
}
