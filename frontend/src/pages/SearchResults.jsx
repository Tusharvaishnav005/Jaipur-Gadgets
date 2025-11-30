import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductGrid from '../components/ProductGrid'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('q')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Search Results for "{search}"
          </h1>
          <ProductGrid search={search} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SearchResults

