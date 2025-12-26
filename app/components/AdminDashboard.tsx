'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChabadHouse, College } from '@prisma/client'

interface Props {
  initialHouses: ChabadHouse[]
  initialColleges: College[]
  counties: string[]
}

type HouseFormData = {
  name: string
  rabbiName: string
  rebbetzinName: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  state: string
  zip: string
  county: string
  yearEstablished: string
}

type CollegeFormData = {
  name: string
  chabadId: string
}

const emptyHouseForm: HouseFormData = {
  name: '',
  rabbiName: '',
  rebbetzinName: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  state: 'NY',
  zip: '',
  county: '',
  yearEstablished: ''
}

const emptyCollegeForm: CollegeFormData = {
  name: '',
  chabadId: ''
}

export default function AdminDashboard({ initialHouses, initialColleges, counties }: Props) {
  const [activeTab, setActiveTab] = useState<'houses' | 'colleges'>('houses')
  const [houses, setHouses] = useState(initialHouses)
  const [colleges, setColleges] = useState(initialColleges)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [houseForm, setHouseForm] = useState<HouseFormData>(emptyHouseForm)
  const [collegeForm, setCollegeForm] = useState<CollegeFormData>(emptyCollegeForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const filteredHouses = houses.filter(house => {
    const searchLower = search.toLowerCase()
    return (
      house.name?.toLowerCase().includes(searchLower) ||
      house.city?.toLowerCase().includes(searchLower) ||
      house.rabbiName?.toLowerCase().includes(searchLower)
    )
  })

  const filteredColleges = colleges.filter(college => {
    const searchLower = search.toLowerCase()
    return college.name?.toLowerCase().includes(searchLower)
  })

  // House handlers
  const handleEditHouse = (house: ChabadHouse) => {
    setEditingId(house.id)
    setHouseForm({
      name: house.name || '',
      rabbiName: house.rabbiName || '',
      rebbetzinName: house.rebbetzinName || '',
      phone: house.phone || '',
      email: house.email || '',
      website: house.website || '',
      address: house.address || '',
      city: house.city || '',
      state: house.state || 'NY',
      zip: house.zip || '',
      county: house.county || '',
      yearEstablished: house.yearEstablished?.toString() || ''
    })
    setShowForm(true)
    setError('')
  }

  const handleAddHouse = () => {
    setEditingId(null)
    setHouseForm(emptyHouseForm)
    setShowForm(true)
    setError('')
  }

  const handleCancelHouse = () => {
    setShowForm(false)
    setEditingId(null)
    setHouseForm(emptyHouseForm)
    setError('')
  }

  const handleSubmitHouse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingId
        ? `/api/admin/chabad-houses/${editingId}`
        : '/api/admin/chabad-houses'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(houseForm)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      router.refresh()
      handleCancelHouse()

      const housesRes = await fetch('/api/admin/chabad-houses')
      const housesData = await housesRes.json()
      setHouses(housesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Chabad House?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/chabad-houses/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete')
      }

      setHouses(houses.filter(h => h.id !== id))
      router.refresh()
    } catch {
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  // College handlers
  const handleEditCollege = (college: College) => {
    setEditingId(college.id)
    setCollegeForm({
      name: college.name || '',
      chabadId: college.chabadId || ''
    })
    setShowForm(true)
    setError('')
  }

  const handleAddCollege = () => {
    setEditingId(null)
    setCollegeForm(emptyCollegeForm)
    setShowForm(true)
    setError('')
  }

  const handleCancelCollege = () => {
    setShowForm(false)
    setEditingId(null)
    setCollegeForm(emptyCollegeForm)
    setError('')
  }

  const handleSubmitCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = editingId
        ? `/api/admin/colleges/${editingId}`
        : '/api/admin/colleges'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collegeForm)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      router.refresh()
      handleCancelCollege()

      const collegesRes = await fetch('/api/admin/colleges')
      const collegesData = await collegesRes.json()
      setColleges(collegesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollege = async (id: string) => {
    if (!confirm('Are you sure you want to delete this college?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete')
      }

      setColleges(colleges.filter(c => c.id !== id))
      router.refresh()
    } catch {
      alert('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const getLinkedChabadHouse = (chabadId: string | null) => {
    if (!chabadId) return null
    return houses.find(h => h.id === chabadId)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Chabad Houses</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{houses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Counties/Boroughs</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{counties.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">With Websites</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">
            {houses.filter(h => h.website).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Colleges</h3>
          <p className="text-3xl font-bold text-[#1e3a5f] mt-1">{colleges.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('houses'); setSearch(''); setShowForm(false); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'houses'
              ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chabad Houses ({houses.length})
        </button>
        <button
          onClick={() => { setActiveTab('colleges'); setSearch(''); setShowForm(false); }}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'colleges'
              ? 'text-[#1e3a5f] border-b-2 border-[#1e3a5f]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Colleges ({colleges.length})
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder={activeTab === 'houses' ? "Search by name, city, or rabbi..." : "Search by college name..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
        <button
          onClick={activeTab === 'houses' ? handleAddHouse : handleAddCollege}
          className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium"
        >
          + Add {activeTab === 'houses' ? 'Chabad House' : 'College'}
        </button>
      </div>

      {/* House Form Modal */}
      {showForm && activeTab === 'houses' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editingId ? 'Edit Chabad House' : 'Add New Chabad House'}
              </h2>
            </div>

            <form onSubmit={handleSubmitHouse} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chabad House Name *
                  </label>
                  <input
                    type="text"
                    value={houseForm.name}
                    onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rabbi Name
                  </label>
                  <input
                    type="text"
                    value={houseForm.rabbiName}
                    onChange={(e) => setHouseForm({ ...houseForm, rabbiName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="Rabbi First Last"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rebbetzin Name
                  </label>
                  <input
                    type="text"
                    value={houseForm.rebbetzinName}
                    onChange={(e) => setHouseForm({ ...houseForm, rebbetzinName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={houseForm.phone}
                    onChange={(e) => setHouseForm({ ...houseForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={houseForm.email}
                    onChange={(e) => setHouseForm({ ...houseForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={houseForm.website}
                    onChange={(e) => setHouseForm({ ...houseForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    placeholder="https://"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={houseForm.address}
                    onChange={(e) => setHouseForm({ ...houseForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={houseForm.city}
                    onChange={(e) => setHouseForm({ ...houseForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={houseForm.state}
                    onChange={(e) => setHouseForm({ ...houseForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={houseForm.zip}
                    onChange={(e) => setHouseForm({ ...houseForm, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County/Borough
                  </label>
                  <select
                    value={houseForm.county}
                    onChange={(e) => setHouseForm({ ...houseForm, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {counties.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year Established
                  </label>
                  <input
                    type="number"
                    value={houseForm.yearEstablished}
                    onChange={(e) => setHouseForm({ ...houseForm, yearEstablished: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancelHouse}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* College Form Modal */}
      {showForm && activeTab === 'colleges' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editingId ? 'Edit College' : 'Add New College'}
              </h2>
            </div>

            <form onSubmit={handleSubmitCollege} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College Name *
                  </label>
                  <input
                    type="text"
                    value={collegeForm.name}
                    onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Chabad House (optional)
                  </label>
                  <select
                    value={collegeForm.chabadId}
                    onChange={(e) => setCollegeForm({ ...collegeForm, chabadId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  >
                    <option value="">None</option>
                    {houses.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.city ? `(${h.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancelCollege}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Houses Table */}
      {activeTab === 'houses' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHouses.map((house) => (
                  <tr key={house.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{house.name}</div>
                      {house.rabbiName && (
                        <div className="text-sm text-gray-500">{house.rabbiName}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div>{house.city}{house.state ? `, ${house.state}` : ''}</div>
                      {house.county && (
                        <div className="text-xs text-gray-400">{house.county}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {house.phone && <div>{house.phone}</div>}
                      {house.email && (
                        <div className="text-xs truncate max-w-[150px]">{house.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {house.website ? (
                        <a
                          href={house.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1e3a5f] hover:underline truncate block max-w-[150px]"
                        >
                          {house.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleEditHouse(house)}
                        className="text-[#1e3a5f] hover:text-[#2c5282] mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHouse(house.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHouses.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No Chabad Houses found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Colleges Table */}
      {activeTab === 'colleges' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Chabad House
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredColleges.map((college) => {
                  const linkedHouse = getLinkedChabadHouse(college.chabadId)
                  return (
                    <tr key={college.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{college.name.trim()}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {linkedHouse ? (
                          <div>
                            <div>{linkedHouse.name}</div>
                            {linkedHouse.city && (
                              <div className="text-xs text-gray-400">{linkedHouse.city}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => handleEditCollege(college)}
                          className="text-[#1e3a5f] hover:text-[#2c5282] mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredColleges.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No colleges found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
