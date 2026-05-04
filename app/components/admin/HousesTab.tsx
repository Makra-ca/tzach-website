'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ChabadHouse } from '@prisma/client'
import type { Dispatch, SetStateAction } from 'react'
import { formatPhone, formatPhoneInput } from '@/lib/formatPhone'
import type { CommonTabProps } from './types'

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

interface Props extends CommonTabProps {
  houses: ChabadHouse[]
  setHouses: Dispatch<SetStateAction<ChabadHouse[]>>
}

export default function HousesTab({ houses, setHouses, showToast, setConfirmModal, setConfirmLoading, closeConfirmModal }: Props) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [houseForm, setHouseForm] = useState<HouseFormData>(emptyHouseForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const filteredHouses = houses.filter(house => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    const searchWords = query.split(/\s+/).filter(w => w.length > 0)
    const searchableText = [house.name, house.city, house.rabbiName, house.rebbetzinName, house.address, house.county, house.email]
      .filter(Boolean).join(' ').toLowerCase()
    return searchWords.every(word => searchableText.includes(word))
  })

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
      const url = editingId ? `/api/admin/chabad-houses/${editingId}` : '/api/admin/chabad-houses'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
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

  const handleDeleteHouse = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Chabad House',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const res = await fetch(`/api/admin/chabad-houses/${id}`, { method: 'DELETE' })
          if (!res.ok) throw new Error('Failed to delete')
          setHouses(prev => prev.filter(h => h.id !== id))
          router.refresh()
          closeConfirmModal()
          showToast('Chabad House deleted successfully', 'success')
        } catch {
          closeConfirmModal()
          showToast('Failed to delete Chabad House', 'error')
        }
      }
    })
  }

  return (
    <>
      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, city, or rabbi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
        <button
          onClick={handleAddHouse}
          className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors font-medium"
        >
          + Add Chabad House
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editingId ? 'Edit Chabad House' : 'Add New Chabad House'}
              </h2>
            </div>
            <form onSubmit={handleSubmitHouse} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chabad House Name *</label>
                  <input type="text" value={houseForm.name} onChange={(e) => setHouseForm({ ...houseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rabbi Name</label>
                  <input type="text" value={houseForm.rabbiName} onChange={(e) => setHouseForm({ ...houseForm, rabbiName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="Rabbi First Last" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rebbetzin Name</label>
                  <input type="text" value={houseForm.rebbetzinName} onChange={(e) => setHouseForm({ ...houseForm, rebbetzinName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formatPhoneInput(houseForm.phone)} onChange={(e) => setHouseForm({ ...houseForm, phone: formatPhoneInput(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={houseForm.email} onChange={(e) => setHouseForm({ ...houseForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input type="url" value={houseForm.website} onChange={(e) => setHouseForm({ ...houseForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" placeholder="https://" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={houseForm.address} onChange={(e) => setHouseForm({ ...houseForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={houseForm.city} onChange={(e) => setHouseForm({ ...houseForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" value={houseForm.state} onChange={(e) => setHouseForm({ ...houseForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" maxLength={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input type="text" value={houseForm.zip} onChange={(e) => setHouseForm({ ...houseForm, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">County/Borough</label>
                  <select value={houseForm.county} onChange={(e) => setHouseForm({ ...houseForm, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent">
                    <option value="">Select...</option>
                    <option value="Brooklyn">Brooklyn</option>
                    <option value="Bronx">Bronx</option>
                    <option value="Manhattan">Manhattan</option>
                    <option value="Nassau">Nassau</option>
                    <option value="Queens">Queens</option>
                    <option value="Staten Island">Staten Island</option>
                    <option value="Suffolk">Suffolk</option>
                    <option value="Westchester">Westchester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Established</label>
                  <input type="number" value={houseForm.yearEstablished} onChange={(e) => setHouseForm({ ...houseForm, yearEstablished: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    min="1900" max={new Date().getFullYear()} />
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button type="button" onClick={handleCancelHouse}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredHouses.map((house) => (
            <div key={house.id} className="p-4 space-y-3">
              <div>
                <div className="font-medium text-gray-900">{house.name}</div>
                {house.rabbiName && <div className="text-sm text-gray-500">{house.rabbiName}</div>}
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 min-w-[60px]">Location:</span>
                  <span>{house.city}{house.state ? `, ${house.state}` : ''}{house.county ? ` (${house.county})` : ''}</span>
                </div>
                {house.phone && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[60px]">Phone:</span>
                    <span>{formatPhone(house.phone)}</span>
                  </div>
                )}
                {house.email && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[60px]">Email:</span>
                    <span className="truncate">{house.email}</span>
                  </div>
                )}
                {house.website && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[60px]">Website:</span>
                    <a href={house.website} target="_blank" rel="noopener noreferrer"
                      className="text-[#1e3a5f] hover:underline truncate">
                      {house.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-2">
                <button onClick={() => handleEditHouse(house)} className="text-[#1e3a5f] hover:text-[#2c5282] text-sm font-medium">Edit</button>
                <button onClick={() => handleDeleteHouse(house.id, house.name)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHouses.map((house) => (
                <tr key={house.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{house.name}</div>
                    {house.rabbiName && <div className="text-sm text-gray-500">{house.rabbiName}</div>}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div>{house.city}{house.state ? `, ${house.state}` : ''}</div>
                    {house.county && <div className="text-xs text-gray-400">{house.county}</div>}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {house.phone && <div>{formatPhone(house.phone)}</div>}
                    {house.email && <div className="text-xs truncate max-w-[150px]">{house.email}</div>}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {house.website ? (
                      <a href={house.website} target="_blank" rel="noopener noreferrer"
                        className="text-[#1e3a5f] hover:underline truncate block max-w-[150px]">
                        {house.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => handleEditHouse(house)} className="text-[#1e3a5f] hover:text-[#2c5282] mr-3">Edit</button>
                    <button onClick={() => handleDeleteHouse(house.id, house.name)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHouses.length === 0 && (
          <div className="p-8 text-center text-gray-500">No Chabad Houses found matching your search.</div>
        )}
      </div>
    </>
  )
}
