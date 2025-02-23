import React from 'react';
import { ExplorerLink } from 'components/ExplorerLink';
import { shortenAddress } from 'utils/helperFunc';
import { CandyShop } from '@liqnft/candy-shop-sdk';

export interface NftStatProps {
  tokenMint: string;
  edition?: number | string | null;
  owner?: string;
  sellerUrl?: string;
  candyShop: CandyShop;
}

export const NftStat: React.FC<NftStatProps> = ({ tokenMint, edition, owner, sellerUrl, candyShop }) => {
  return (
    <div className="candy-stat-horizontal">
      <div>
        <div className="candy-label">MINT ADDRESS</div>
        <div className="candy-value">
          <ExplorerLink type="address" address={tokenMint} source={candyShop.explorerLink} env={candyShop.env} />
        </div>
      </div>
      {edition && edition !== '0' ? (
        <>
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">EDITION</div>
            <div className="candy-value">{edition}</div>
          </div>
        </>
      ) : null}
      {owner ? (
        <>
          <div className="candy-stat-horizontal-line" />
          <div>
            <div className="candy-label">OWNER</div>
            <div className="candy-value">
              {sellerUrl ? (
                <a
                  href={sellerUrl.replace('{{sellerAddress}}', owner)}
                  target="_blank"
                  rel="noreferrer noopener"
                  title="Seller profile"
                >
                  {shortenAddress(owner)}
                </a>
              ) : (
                <ExplorerLink type="address" address={owner} source={candyShop.explorerLink} env={candyShop.env} />
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
