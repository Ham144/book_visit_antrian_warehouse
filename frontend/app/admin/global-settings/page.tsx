"use client";
import React from "react";

const GlobalSettingsPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-4 md:p-6">
      <div className="container mx-auto">
        <form id="settings-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-teal-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Organization Settings
              </h2>
              <p className="text-teal-100 text-sm mt-1">
                Konfigurasi organisasi dan Active Directory
              </p>
            </div>
  
            <div className="p-6 md:p-8 space-y-8 max-h-[calc(100vh-300px)] overflow-auto">
              {/* Organization Name */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-teal-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-teal-900"
                    >
                      Nama Organisasi
                    </label>
                    <p className="text-sm text-gray-500">
                      Nama resmi organisasi yang akan ditampilkan di sistem
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={settingsData.name}
                  onChange={(e) => setSettingsData({...settingsData, name: e.target.value})}
                  className="mt-2 w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                  placeholder="Masukkan nama organisasi"
                />
              </div>
  
              {/* Active Directory Configuration */}
              <div className="border-t border-teal-100 pt-8 space-y-6">
                <h3 className="text-lg font-semibold text-teal-900">
                  Konfigurasi Active Directory
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AD Host */}
                  <div className="space-y-3">
                    <label
                      htmlFor="AD_HOST"
                      className="block text-sm font-semibold text-teal-900"
                    >
                      AD Host
                    </label>
                    <input
                      type="text"
                      id="AD_HOST"
                      name="AD_HOST"
                      value={settingsData.AD_HOST || ''}
                      onChange={(e) => setSettingsData({...settingsData, AD_HOST: e.target.value})}
                      className="mt-1 w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                      placeholder="Contoh: ldap.example.com"
                    />
                    <p className="text-xs text-gray-500">
                      Hostname atau IP server Active Directory
                    </p>
                  </div>
  
                  {/* AD Port */}
                  <div className="space-y-3">
                    <label
                      htmlFor="AD_PORT"
                      className="block text-sm font-semibold text-teal-900"
                    >
                      AD Port
                    </label>
                    <input
                      type="text"
                      id="AD_PORT"
                      name="AD_PORT"
                      value={settingsData.AD_PORT || ''}
                      onChange={(e) => setSettingsData({...settingsData, AD_PORT: e.target.value})}
                      className="mt-1 w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                      placeholder="Contoh: 389"
                    />
                    <p className="text-xs text-gray-500">
                      Port untuk koneksi LDAP
                    </p>
                  </div>
  
                  {/* AD Domain */}
                  <div className="space-y-3">
                    <label
                      htmlFor="AD_DOMAIN"
                      className="block text-sm font-semibold text-teal-900"
                    >
                      AD Domain
                    </label>
                    <input
                      type="text"
                      id="AD_DOMAIN"
                      name="AD_DOMAIN"
                      value={settingsData.AD_DOMAIN || ''}
                      onChange={(e) => setSettingsData({...settingsData, AD_DOMAIN: e.target.value})}
                      className="mt-1 w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                      placeholder="Contoh: example.com"
                    />
                    <p className="text-xs text-gray-500">
                      Domain Active Directory
                    </p>
                  </div>
  
                  {/* AD Base DN */}
                  <div className="space-y-3">
                    <label
                      htmlFor="AD_BASE_DN"
                      className="block text-sm font-semibold text-teal-900"
                    >
                      AD Base DN
                    </label>
                    <input
                      type="text"
                      id="AD_BASE_DN"
                      name="AD_BASE_DN"
                      value={settingsData.AD_BASE_DN || ''}
                      onChange={(e) => setSettingsData({...settingsData, AD_BASE_DN: e.target.value})}
                      className="mt-1 w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-teal-50/50"
                      placeholder="Contoh: DC=example,DC=com"
                    />
                    <p className="text-xs text-gray-500">
                      Base Distinguished Name untuk pencarian
                    </p>
                  </div>
                </div>
              </div>
  
              {/* Disabled Features */}
              <div className="border-t border-teal-100 pt-8 space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-teal-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-teal-900">
                      Fitur yang Dinonaktifkan
                    </h3>
                    <p className="text-sm text-gray-500">
                      Pilih fitur yang ingin dinonaktifkan di organisasi ini
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 'REPORTING', label: 'Laporan' },
                    { id: 'ANALYTICS', label: 'Analytics' },
                    { id: 'API_INTEGRATION', label: 'Integrasi API' },
                    { id: 'EMAIL_NOTIFICATION', label: 'Notifikasi Email' },
                    { id: 'MOBILE_ACCESS', label: 'Akses Mobile' },
                    { id: 'AUDIT_LOG', label: 'Log Audit' },
                  ].map((feature) => (
                    <div key={feature.id} className="flex items-center p-3 border border-teal-200 rounded-lg">
                      <input
                        type="checkbox"
                        id={`feature-${feature.id}`}
                        checked={settingsData.disabledFeatures.includes(feature.id)}
                        onChange={(e) => {
                          const newFeatures = e.target.checked
                            ? [...settingsData.disabledFeatures, feature.id]
                            : settingsData.disabledFeatures.filter(f => f !== feature.id);
                          setSettingsData({...settingsData, disabledFeatures: newFeatures});
                        }}
                        className="h-4 w-4 text-teal-600 border-teal-300 rounded focus:ring-teal-500"
                      />
                      <label
                        htmlFor={`feature-${feature.id}`}
                        className="ml-2 text-sm font-medium text-teal-900"
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
  
              {/* Quick Actions */}
              <div className="border-t border-teal-100 pt-8">
                <h3 className="text-lg font-semibold text-teal-900 mb-4">
                  Aksi Cepat
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsData({
                        ...settingsData,
                        AD_HOST: 'ldap.example.com',
                        AD_PORT: '389',
                        AD_DOMAIN: 'example.com',
                        AD_BASE_DN: 'DC=example,DC=com'
                      });
                    }}
                    className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition duration-200 font-medium text-sm"
                  >
                    Setelan AD Standar
                  </button>
  
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsData({
                        name: settingsData.name,
                        disabledFeatures: []
                      });
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200 font-medium text-sm"
                  >
                    Reset Konfigurasi AD
                  </button>
                </div>
              </div>
            </div>
  
            {/* Form Footer */}
            <div className="bg-teal-50 px-6 py-4 border-t border-teal-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="text-sm text-teal-700 mb-3 md:mb-0">
                  <p className="font-medium">
                    Terakhir diperbarui: {settingsData.name ? "Baru saja" : "Belum pernah"}
                  </p>
                  <p>
                    Organisasi: {settingsData.name || "Belum diatur"}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalSettingsPage;
