import React, { useEffect, useState } from 'react';
import { CandyShop, EditionDrop, fetchUserMasterNFTs } from '@liqnft/candy-shop-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { Empty } from 'components/Empty';
import { Card } from 'components/Card';
import { LoadingSkeleton } from 'components/LoadingSkeleton';
import { IconTick } from 'assets/IconTick';

import { LoadStatus } from 'constant';
import { notification, NotificationType } from 'utils/rc-notification';

interface DropSelectionProps {
  candyShop: CandyShop;
  onSelect: (item: EditionDrop) => () => void;
  onNext: () => void;
  dropNft?: EditionDrop;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
}

const Logger = 'CandyShopUI/DropSelection';

export const DropSelection: React.FC<DropSelectionProps> = ({
  candyShop,
  dropNft,
  onSelect,
  onNext,
  wallet,
  walletConnectComponent
}) => {
  const [dropNfts, setDropNfts] = useState<EditionDrop[]>([]);
  const [loading, setLoading] = useState<LoadStatus>(LoadStatus.ToLoad);

  useEffect(() => {
    if (!wallet?.publicKey) return;
    setLoading(LoadStatus.Loading);
    const connection = candyShop.connection();

    fetchUserMasterNFTs(wallet.publicKey, connection)
      .then((result: EditionDrop[]) => {
        console.log('Master NFT:', result);
        if (result) return setDropNfts(result);
        console.log(`${Logger} fetchUserMasterNFTs failed`);
        notification('Get wallet master NFT failed', NotificationType.Error);
      })
      .catch((error: Error) => {
        console.log(`${Logger} fetchUserMasterNFTs failed, error=`, error);
        notification('Get wallet master NFT failed', NotificationType.Error);
      })
      .finally(() => setLoading(LoadStatus.Loaded));
  }, [candyShop, wallet?.publicKey]);

  if (!wallet?.publicKey) return walletConnectComponent;

  const emptyDrops = loading === LoadStatus.Loaded && dropNfts.length === 0;

  return (
    <>
      <div className="candy-edition-description">
        Select the NFT you want to create a new edition drop for! Please note, an edition drop must be created using an
        NFT with a Metaplex maximum supply attribute of greater than 1.
      </div>

      {loading !== LoadStatus.ToLoad && (
        <>
          <div className="candy-edition-list candy-container-list">
            {dropNfts.map((nft) => (
              <Card
                key={nft.tokenAccountAddress}
                className={dropNft?.tokenAccountAddress === nft.tokenAccountAddress ? 'selected' : ''}
                imgUrl={nft.nftImage}
                onClick={onSelect(nft)}
                label={
                  dropNft?.tokenAccountAddress === nft.tokenAccountAddress ? (
                    <span className="candy-edition-tick-label">
                      <IconTick fill="#7522f5" />
                    </span>
                  ) : undefined
                }
                footer={
                  <div className="candy-edition-footer-card">
                    <div className="name-container">
                      <div className="name candy-line-limit-1">{nft.name}</div>
                      <div className="ticker">{nft.symbol}</div>
                    </div>
                    <div className="candy-line-limit-1 supply">
                      {0}/{nft.maxSupply}
                    </div>
                  </div>
                }
              />
            ))}
          </div>
          {loading === LoadStatus.Loading && <LoadingSkeleton />}

          {emptyDrops ? null : (
            <button
              disabled={!dropNft}
              className={`candy-button candy-edition-select-button ${dropNft ? '' : 'disabled'}`}
              onClick={onNext}
            >
              Continue
            </button>
          )}
        </>
      )}

      {emptyDrops && (
        <Empty description="No available or eligible NFTs found. Please ensure you have NFTs that have a max supply >1 in the active wallet." />
      )}
    </>
  );
};
