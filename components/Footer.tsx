import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-slate-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand & Description */}
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Coat_of_arms_of_West_Nusa_Tenggara.svg/250px-Coat_of_arms_of_West_Nusa_Tenggara.svg.png" alt="Logo NTB" className="h-10 w-auto bg-white p-1 rounded-sm" />
                            <h2 className="text-xl font-bold text-white">Monitoring Paket Pengadaan Provinsi NTB</h2>
                        </div>
                        <p className="text-sm max-w-md">
                            Menyediakan platform publik untuk memantau transparansi, progres, dan realisasi anggaran pada setiap paket pengadaan di lingkungan Pemerintah Provinsi Nusa Tenggara Barat.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-md font-semibold text-white uppercase tracking-wider">Navigasi Cepat</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#stats" className="hover:text-blue-400 transition-colors text-sm">Statistik</a></li>
                            <li><a href="#dashboard-main" className="hover:text-blue-400 transition-colors text-sm">Daftar Paket</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors text-sm">Tentang Kami (placeholder)</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Terhubung */}
                    <div>
                        <h3 className="text-md font-semibold text-white uppercase tracking-wider">Terhubung</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <a href="https://spse.inaproc.id/ntbprov/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors text-sm inline-flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>
                                    Website SPSE NTB
                                </a>
                            </li>
                             <li>
                                <span className="text-sm inline-flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    biropbj@ntbprov.go.id
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Biro Pengadaan Barang dan Jasa NTB. All rights reserved.</p>
                    {/* Social Icons Placeholder */}
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                         <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors"><span className="sr-only">Facebook</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
                         <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors"><span className="sr-only">Instagram</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.161 4.573a.75.75 0 01.75.75v1.309a.75.75 0 01-1.5 0V7.323a.75.75 0 01.75-.75zM12 9a3 3 0 100 6 3 3 0 000-6zm-5 3a5 5 0 1110 0 5 5 0 01-10 0z" clipRule="evenodd" /></svg></a>
                         <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;